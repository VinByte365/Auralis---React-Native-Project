const mongoose = require("mongoose");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const ActivityLogs = require("../models/activityLogsModel");
const Promo = require("../models/promoModel");
const Return = require("../models/ReturnModel");

const ORDER_REVENUE_EXCLUDED_STATUSES = ["CANCELLED", "REFUNDED"];

function parseDateRange({ startDate, endDate } = {}) {
  const range = {};

  if (startDate) {
    const parsedStart = new Date(startDate);
    if (!Number.isNaN(parsedStart.getTime())) {
      range.$gte = parsedStart;
    }
  }

  if (endDate) {
    const parsedEnd = new Date(endDate);
    if (!Number.isNaN(parsedEnd.getTime())) {
      range.$lte = parsedEnd;
    }
  }

  return Object.keys(range).length ? range : null;
}

function buildOrderDateFilter(params = {}) {
  const dateRange = parseDateRange(params);
  if (!dateRange) return {};
  return { createdAt: dateRange };
}

function toDateLabel(date, groupBy) {
  const d = new Date(date);
  if (groupBy === "month") {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  if (groupBy === "week") {
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const dayDiff = Math.floor((d - startOfYear) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((dayDiff + startOfYear.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
  }
  return d.toISOString().slice(0, 10);
}

async function getRevenueAndOrderCount(orderFilter = {}) {
  const revenueFilter = {
    ...orderFilter,
    status: { $nin: ORDER_REVENUE_EXCLUDED_STATUSES },
  };

  const [revenueResult, totalOrders] = await Promise.all([
    Order.aggregate([
      { $match: revenueFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$finalAmountPaid" },
        },
      },
    ]),
    Order.countDocuments(orderFilter),
  ]);

  return {
    totalRevenue: revenueResult[0]?.totalRevenue || 0,
    totalOrders,
  };
}

exports.getDashboardSummary = async () => {
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const [
    totals,
    totalCustomers,
    totalProducts,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    todayMetrics,
  ] = await Promise.all([
    getRevenueAndOrderCount({}),
    User.countDocuments({ role: { $ne: "admin" } }),
    Product.countDocuments({ deletedAt: null }),
    Order.countDocuments({ status: "PENDING" }),
    Order.countDocuments({ status: "COMPLETED" }),
    Order.countDocuments({ status: "CANCELLED" }),
    getRevenueAndOrderCount({ createdAt: { $gte: todayStart } }),
  ]);

  return {
    totalRevenue: totals.totalRevenue,
    totalOrders: totals.totalOrders,
    totalCustomers,
    totalProducts,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    todayRevenue: todayMetrics.totalRevenue,
    todayOrders: todayMetrics.totalOrders,
  };
};

exports.getSalesAnalytics = async (params = {}) => {
  const groupBy = ["day", "week", "month"].includes(params.groupBy)
    ? params.groupBy
    : "day";

  const orderFilter = {
    ...buildOrderDateFilter(params),
    status: { $nin: ORDER_REVENUE_EXCLUDED_STATUSES },
  };

  const [summary, rawOrders] = await Promise.all([
    getRevenueAndOrderCount(orderFilter),
    Order.find(orderFilter)
      .select("createdAt finalAmountPaid")
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  const bucket = new Map();
  rawOrders.forEach((order) => {
    const key = toDateLabel(order.createdAt, groupBy);
    const current = bucket.get(key) || { period: key, revenue: 0, orders: 0 };
    current.revenue += Number(order.finalAmountPaid || 0);
    current.orders += 1;
    bucket.set(key, current);
  });

  return {
    totalRevenue: summary.totalRevenue,
    totalOrders: summary.totalOrders,
    groupBy,
    chart: Array.from(bucket.values()),
  };
};

exports.getProductAnalytics = async (params = {}) => {
  const limit = Math.max(Number(params.limit) || 10, 1);
  const orderFilter = buildOrderDateFilter(params);

  const topProducts = await Order.aggregate([
    { $match: { ...orderFilter, status: { $nin: ["CANCELLED"] } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        productName: { $first: "$items.name" },
        sku: { $first: "$items.sku" },
        unitsSold: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.itemTotal" },
      },
    },
    { $sort: { revenue: -1, unitsSold: -1 } },
    { $limit: limit },
  ]);

  return {
    topProducts,
    sortBy: params.sortBy || "revenue",
  };
};

exports.getCategoryAnalytics = async (params = {}) => {
  const orderFilter = buildOrderDateFilter(params);

  const categoryRevenue = await Order.aggregate([
    { $match: { ...orderFilter, status: { $nin: ["CANCELLED"] } } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: {
        path: "$product",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "product.category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$category._id",
        categoryName: { $first: "$category.categoryName" },
        revenue: { $sum: "$items.itemTotal" },
        unitsSold: { $sum: "$items.quantity" },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  return {
    categories: categoryRevenue,
  };
};

exports.getUserAnalytics = async (params = {}) => {
  const dateRange = parseDateRange(params);
  const userDateFilter = dateRange ? { createdAt: dateRange } : {};
  const orderDateFilter = buildOrderDateFilter(params);

  const [newUsers, totalUsers, activeUsers, topCustomers] = await Promise.all([
    User.countDocuments(userDateFilter),
    User.countDocuments({}),
    User.countDocuments({ status: "active" }),
    Order.aggregate([
      { $match: { ...orderDateFilter, status: { $nin: ["CANCELLED"] } } },
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$finalAmountPaid" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: "$user._id",
          name: "$user.name",
          email: "$user.email",
          status: "$user.status",
          orderCount: 1,
          totalSpent: 1,
        },
      },
    ]),
  ]);

  return {
    totalUsers,
    newUsers,
    activeUsers,
    retentionRate:
      totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
    topCustomers,
  };
};

exports.getOrderAnalytics = async (params = {}) => {
  const orderFilter = buildOrderDateFilter(params);

  const [totals, statusBreakdown] = await Promise.all([
    getRevenueAndOrderCount(orderFilter),
    Order.aggregate([
      { $match: orderFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const statusCounts = statusBreakdown.reduce((acc, item) => {
    acc[item._id || "UNKNOWN"] = item.count;
    return acc;
  }, {});

  return {
    totalOrders: totals.totalOrders,
    totalRevenue: totals.totalRevenue,
    averageOrderValue:
      totals.totalOrders > 0 ? totals.totalRevenue / totals.totalOrders : 0,
    statusCounts,
  };
};

exports.getInventoryAnalytics = async () => {
  const [totalProducts, outOfStock, lowStock, inventoryValue] =
    await Promise.all([
      Product.countDocuments({ deletedAt: null }),
      Product.countDocuments({ deletedAt: null, stockQuantity: 0 }),
      Product.countDocuments({
        deletedAt: null,
        stockQuantity: { $gt: 0, $lte: 10 },
      }),
      Product.aggregate([
        { $match: { deletedAt: null } },
        {
          $group: {
            _id: null,
            totalValue: {
              $sum: {
                $multiply: ["$stockQuantity", "$price"],
              },
            },
          },
        },
      ]),
    ]);

  return {
    totalProducts,
    outOfStock,
    lowStock,
    inStock: totalProducts - outOfStock,
    inventoryValue: inventoryValue[0]?.totalValue || 0,
  };
};

exports.getPromotionAnalytics = async (params = {}) => {
  const dateRange = parseDateRange(params);
  const promoFilter = dateRange ? { createdAt: dateRange } : {};

  const [totalPromotions, activePromotions, usageSummary] = await Promise.all([
    Promo.countDocuments(promoFilter),
    Promo.countDocuments({ ...promoFilter, active: true }),
    Promo.aggregate([
      { $match: promoFilter },
      {
        $group: {
          _id: null,
          totalUsed: { $sum: "$usedCount" },
          totalLimit: { $sum: "$usageLimit" },
        },
      },
    ]),
  ]);

  return {
    totalPromotions,
    activePromotions,
    totalUsed: usageSummary[0]?.totalUsed || 0,
    totalLimit: usageSummary[0]?.totalLimit || 0,
  };
};

exports.getReturnAnalytics = async (params = {}) => {
  const dateRange = parseDateRange(params);
  const returnFilter = dateRange ? { createdAt: dateRange } : {};

  const [totalReturns, completedReturns, rejectedReturns] = await Promise.all([
    Return.countDocuments(returnFilter),
    Return.countDocuments({ ...returnFilter, status: "COMPLETED" }),
    Return.countDocuments({ ...returnFilter, status: "REJECTED" }),
  ]);

  return {
    totalReturns,
    completedReturns,
    rejectedReturns,
  };
};

exports.getActivityLogs = async (params = {}) => {
  const { limit = 50, page = 1, userId, action, status } = params;

  const numericLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
  const numericPage = Math.max(Number(page) || 1, 1);

  const filters = {};
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    filters.user = new mongoose.Types.ObjectId(userId);
  }
  if (action) filters.action = action;
  if (status) filters.status = status;

  const logs = await ActivityLogs.find(filters)
    .populate("user", "name email role")
    .sort({ createdAt: -1 })
    .skip((numericPage - 1) * numericLimit)
    .limit(numericLimit)
    .lean();

  return logs;
};

exports.getCheckoutQueueAnalytics = async () => {
  const [pending, processing, confirmed] = await Promise.all([
    Order.countDocuments({ status: "PENDING" }),
    Order.countDocuments({ status: "PROCESSING" }),
    Order.countDocuments({ status: "CONFIRMED" }),
  ]);

  return {
    pending,
    processing,
    confirmed,
    queueTotal: pending + processing + confirmed,
  };
};

exports.getStaffPerformanceAnalytics = async (params = {}) => {
  const limit = Math.max(Number(params.limit) || 10, 1);
  const dateRange = parseDateRange(params);
  const activityMatch = {
    action: {
      $in: [
        "CHECKOUT",
        "UPDATE_STOCK",
        "CREATE_PRODUCT",
        "UPDATE_PRODUCT",
        "DELETE_PRODUCT",
        "CREATE_USER",
        "UPDATE_USER",
      ],
    },
  };

  if (dateRange) {
    activityMatch.createdAt = dateRange;
  }

  const staffMetrics = await ActivityLogs.aggregate([
    { $match: activityMatch },
    {
      $group: {
        _id: "$user",
        processed: { $sum: 1 },
      },
    },
    { $sort: { processed: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: "$user._id",
        name: "$user.name",
        role: "$user.role",
        processed: 1,
        avgTime: { $literal: "N/A" },
        rating: { $literal: "N/A" },
      },
    },
  ]);

  return staffMetrics;
};

exports.getCustomerInsights = async (params = {}) => {
  const limit = Math.max(Number(params.limit) || 10, 1);

  const insights = await Order.aggregate([
    { $match: { status: { $nin: ["CANCELLED"] }, user: { $ne: null } } },
    {
      $group: {
        _id: "$user",
        orderCount: { $sum: 1 },
        totalSpent: { $sum: "$finalAmountPaid" },
        lastOrderAt: { $max: "$createdAt" },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: "$user._id",
        name: "$user.name",
        email: "$user.email",
        status: "$user.status",
        orderCount: 1,
        totalSpent: 1,
        lastOrderAt: 1,
      },
    },
  ]);

  return insights;
};

exports.getProductPerformanceAnalytics = async (params = {}) => {
  const limit = Math.max(Number(params.limit) || 20, 1);
  const orderFilter = buildOrderDateFilter(params);

  return Order.aggregate([
    { $match: { ...orderFilter, status: { $nin: ["CANCELLED"] } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$items.name" },
        sku: { $first: "$items.sku" },
        unitsSold: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.itemTotal" },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: limit },
  ]);
};

exports.getFinancialReports = async (params = {}) => {
  const orderFilter = buildOrderDateFilter(params);

  const [totals, refundCount] = await Promise.all([
    getRevenueAndOrderCount(orderFilter),
    Order.countDocuments({ ...orderFilter, status: "REFUNDED" }),
  ]);

  return {
    totalRevenue: totals.totalRevenue,
    totalOrders: totals.totalOrders,
    averageOrderValue:
      totals.totalOrders > 0 ? totals.totalRevenue / totals.totalOrders : 0,
    refundedOrders: refundCount,
  };
};

exports.getPredictiveAnalytics = async (params = {}) => {
  const forecastDays = Math.max(Number(params.forecastDays) || 30, 1);
  const now = new Date();
  const recentStart = new Date(now);
  recentStart.setDate(now.getDate() - 30);

  const previousStart = new Date(recentStart);
  previousStart.setDate(recentStart.getDate() - 30);

  const [recent, previous] = await Promise.all([
    getRevenueAndOrderCount({ createdAt: { $gte: recentStart, $lte: now } }),
    getRevenueAndOrderCount({
      createdAt: { $gte: previousStart, $lt: recentStart },
    }),
  ]);

  const dailyRevenue = recent.totalRevenue / 30;
  const projectedRevenue = Math.round(dailyRevenue * forecastDays);

  const previousOrders = previous.totalOrders || 0;
  const orderGrowth =
    previousOrders > 0
      ? `${Math.round(((recent.totalOrders - previousOrders) / previousOrders) * 100)}%`
      : "N/A";

  return {
    forecastDays,
    projectedRevenue,
    orderGrowth,
    baselinePeriodDays: 30,
  };
};
