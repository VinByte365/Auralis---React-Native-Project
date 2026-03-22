const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const { createLog } = require("./activityLogsService");
const { sendPushToUser } = require("./notificationService");

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function getPushTokenAndTrigger(userId, body, data = {}) {
  if (!userId) return;

  const user = await User.findById(userId).select("pushToken");
  const pushToken =
    typeof user?.pushToken === "string"
      ? user.pushToken
      : user?.pushToken?.token;

  if (!pushToken) return;

  try {
    const result = await sendPushToUser(pushToken, "Auralis", body, data);

    if (!result?.sent) {
      console.log(
        `[Push] Skipped notification for user ${userId}: ${result?.reason || "unknown_reason"}`,
      );
      return;
    }

    const hasErrorTicket = (result.tickets || []).some(
      (ticket) => ticket?.status === "error",
    );
    if (hasErrorTicket) {
      console.log(
        `[Push] Expo returned error ticket(s) for user ${userId}`,
        result.tickets,
      );
    }
  } catch (error) {
    console.log(
      `[Push] Failed to send notification for user ${userId}:`,
      error?.message || error,
    );
  }
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

    await getPushTokenAndTrigger(
      userId,
      `Your order ${createdOrder._id} is now pending`,
      {
        screen: "Order",
        params: { orderId: String(createdOrder._id) },
      },
    );

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

  if (!orderId) throw new Error("orderId is required");
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
  ).populate("user", "name email");

  if (!order) throw new Error("order not found");

  await getPushTokenAndTrigger(
    order.user?._id || order.user,
    `Your order ${order._id} is now ${status}`,
    {
      screen: "Order",
      params: { orderId: String(order._id) },
    },
  );

  return order;
};
