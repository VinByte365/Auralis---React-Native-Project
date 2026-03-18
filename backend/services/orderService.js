const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const { createLog } = require("./activityLogsService");

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildCheckoutCode() {
  return `CHK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

exports.confirmOrder = async (request = {}) => {
  const { userId } = request.user || {};
  const { items = [], discounts = {}, cashierId } = request.body || {};

  if (!userId) throw new Error("authenticated user is required");
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("order items are required");
  }

  const productIds = items.map((item) => item.productId).filter(Boolean);
  const products = await Product.find({
    _id: { $in: productIds },
    deletedAt: null,
  }).populate("category");

  const productMap = new Map(
    products.map((product) => [String(product._id), product]),
  );

  const formattedItems = items.map((item) => {
    const product = productMap.get(String(item.productId));
    if (!product) {
      throw new Error(`product not found: ${item.productId}`);
    }

    const quantity = Math.max(toNumber(item.quantity, 1), 1);
    const unitPrice =
      product.saleActive && product.salePrice
        ? product.salePrice
        : product.price;
    const itemTotal = unitPrice * quantity;

    return {
      product: product._id,
      name: product.name,
      sku: product.sku,
      quantity,
      unitPrice,
      salePrice: product.salePrice,
      saleActive: product.saleActive,
      categoryType: product.category?.categoryName || "",
      isBNPCEligible: Boolean(product.category?.isBNPC),
      isBNPCProduct: Boolean(product.category?.isBNPC),
      excludedFromDiscount: Boolean(product.excludedFromDiscount),
      category: {
        id: product.category?._id,
        name: product.category?.categoryName,
        isBNPC: Boolean(product.category?.isBNPC),
      },
      unit: product.unit,
      itemTotal,
    };
  });

  const baseAmount = formattedItems.reduce(
    (sum, item) => sum + item.itemTotal,
    0,
  );
  const totalDiscount = toNumber(discounts.total, 0);
  const finalAmountPaid = Math.max(baseAmount - totalDiscount, 0);

  const order = await Order.create({
    user: userId,
    cashier: cashierId || userId,
    appUser: true,
    checkoutCode: buildCheckoutCode(),
    items: formattedItems,
    bnpcProducts: formattedItems
      .filter((item) => item.isBNPCEligible)
      .map((item) => ({
        productId: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.unitPrice,
        salePrice: item.salePrice,
        saleActive: item.saleActive,
        unit: item.unit,
        category: item.category?.id,
        categoryName: item.category?.name,
        isBNPCEligible: item.isBNPCEligible,
        requiresVerification: item.isBNPCEligible,
        itemTotal: item.itemTotal,
      })),
    hasBNPCItems: formattedItems.some((item) => item.isBNPCEligible),
    baseAmount,
    bnpcEligibleSubtotal: formattedItems
      .filter((item) => item.isBNPCEligible)
      .reduce((sum, item) => sum + item.itemTotal, 0),
    bnpcDiscount: {
      total: toNumber(discounts.bnpc, 0),
    },
    promoDiscount: {
      code: discounts.promoCode,
      amount: toNumber(discounts.promo, 0),
      serverValidated: false,
    },
    loyaltyDiscount: {
      pointsUsed: toNumber(discounts.pointsUsed, 0),
      amount: toNumber(discounts.loyalty, 0),
      pointsEarned: Math.floor(finalAmountPaid / 100),
    },
    voucherDiscount: toNumber(discounts.voucher, 0),
    discountBreakdown: {
      bnpc: toNumber(discounts.bnpc, 0),
      promo: toNumber(discounts.promo, 0),
      loyalty: toNumber(discounts.loyalty, 0),
      voucher: toNumber(discounts.voucher, 0),
      total: totalDiscount,
    },
    finalAmountPaid,
    pointsEarned: Math.floor(finalAmountPaid / 100),
    itemStats: {
      totalItems: formattedItems.length,
      totalQuantity: formattedItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      ),
      bnpcEligibleItems: formattedItems.filter((item) => item.isBNPCEligible)
        .length,
      bnpcEligibleQuantity: formattedItems
        .filter((item) => item.isBNPCEligible)
        .reduce((sum, item) => sum + item.quantity, 0),
    },
    status: "CONFIRMED",
  });

  await Product.bulkWrite(
    formattedItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stockQuantity: -item.quantity } },
      },
    })),
  );

  createLog(
    userId,
    "CHECKOUT",
    "SUCCESS",
    `Completed checkout ${order.checkoutCode}`,
  );

  return order;
};

exports.getOrders = async (request = {}) => {
  const { userId } = request.user || {};
  if (!userId) throw new Error("authenticated user is required");

  return Order.find({ user: userId })
    .populate("items.product")
    .sort({ createdAt: -1 });
};

exports.getAllOrdersAdmin = async (request = {}) => {
  const { status, search, page = 1, limit = 20 } = request.query || {};

  const filters = {};
  if (status) filters.status = status;
  if (search) filters.checkoutCode = { $regex: search, $options: "i" };

  const numericPage = Math.max(Number(page), 1);
  const numericLimit = Math.min(Math.max(Number(limit), 1), 100);

  const [orders, total] = await Promise.all([
    Order.find(filters)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit),
    Order.countDocuments(filters),
  ]);

  return {
    orders,
    pagination: {
      page: numericPage,
      limit: numericLimit,
      total,
      hasMore: numericPage * numericLimit < total,
    },
  };
};

exports.updateOrderStatus = async (request = {}) => {
  const { orderId } = request.params || {};
  const { status } = request.body || {};

  if (!status) throw new Error("status is required");

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      status,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!order) throw new Error("order not found");
  return order;
};
