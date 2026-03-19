const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const mongoose = require("mongoose");
const { createLog } = require("./activityLogsService");

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

exports.confirmOrder = async (request = {}) => {
  const { userId } = request.user || {};
  const {
    items = [],
    discounts = {},
    paymentMethod = "cod",
    paymentDetails = {},
    deliveryAddress = "",
  } = request.body || {};

  if (!userId) throw new Error("authenticated user is required");
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("order items are required");
  }

  const session = await mongoose.startSession();

  try {
    let createdOrder = null;

    await session.withTransaction(async () => {
      const productIds = items.map((item) => item.productId).filter(Boolean);
      const products = await Product.find({
        _id: { $in: productIds },
        deletedAt: null,
      })
        .populate("category")
        .session(session);

      const productMap = new Map(
        products.map((product) => [String(product._id), product]),
      );

      const formattedItems = items.map((item) => {
        const product = productMap.get(String(item.productId));
        if (!product) {
          throw new Error(`product not found: ${item.productId}`);
        }

        const quantity = Math.max(toNumber(item.quantity, 1), 1);
        if (toNumber(product.stockQuantity, 0) < quantity) {
          throw new Error(`insufficient stock for ${product.name}`);
        }

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
          itemTotal,
        };
      });

      const baseAmount = formattedItems.reduce(
        (sum, item) => sum + item.itemTotal,
        0,
      );
      const totalDiscount = toNumber(discounts.total, 0);
      const finalAmountPaid = Math.max(baseAmount - totalDiscount, 0);

      const created = await Order.create(
        [
          {
            user: userId,
            items: formattedItems,
            baseAmount,
            finalAmountPaid,
            paymentMethod,
            paymentDetails,
            deliveryAddress,
            status: "PENDING",
          },
        ],
        { session },
      );

      createdOrder = created[0];

      const stockUpdates = await Product.bulkWrite(
        formattedItems.map((item) => ({
          updateOne: {
            filter: {
              _id: item.product,
              stockQuantity: { $gte: item.quantity },
            },
            update: { $inc: { stockQuantity: -item.quantity } },
          },
        })),
        { session },
      );

      if (stockUpdates.matchedCount !== formattedItems.length) {
        throw new Error("checkout failed due to stock changes");
      }
    });

    createLog(
      userId,
      "CHECKOUT",
      "SUCCESS",
      `Completed checkout ${createdOrder._id}`,
    );

    return createdOrder;
  } finally {
    await session.endSession();
  }
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
  if (search) {
    filters.$or = [
      { paymentMethod: { $regex: search, $options: "i" } },
      { deliveryAddress: { $regex: search, $options: "i" } },
    ];
  }

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
