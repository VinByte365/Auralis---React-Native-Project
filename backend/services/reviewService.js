const mongoose = require("mongoose");

const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Review = require("../models/reviewModel");

async function ensureVerifiedPurchase(productId, userId) {
  const verifiedOrder = await Order.findOne({
    user: userId,
    status: { $in: ["CONFIRMED", "PROCESSING", "COMPLETED"] },
    "items.product": productId,
  }).select("_id");

  if (!verifiedOrder) {
    throw new Error("verified purchase is required before leaving a review");
  }

  return verifiedOrder;
}

exports.listByProduct = async (request = {}) => {
  const { productId } = request.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("invalid product id");
  }

  const [reviews, stats] = await Promise.all([
    Review.find({ product: productId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .lean(),
    Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
        },
      },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]),
  ]);

  return {
    reviews,
    summary: {
      averageRating: Number(stats?.[0]?.averageRating || 0).toFixed(1),
      totalReviews: stats?.[0]?.totalReviews || 0,
    },
  };
};

exports.create = async (request = {}) => {
  const { userId } = request.user || {};
  const { productId, rating, comment } = request.body || {};

  if (!userId) throw new Error("missing authenticated user");
  if (!productId) throw new Error("productId is required");
  if (!rating) throw new Error("rating is required");

  const product = await Product.findById(productId).select("_id deletedAt");
  if (!product || product.deletedAt) {
    throw new Error("product is not available for review");
  }

  const verifiedOrder = await ensureVerifiedPurchase(productId, userId);

  const existingReview = await Review.findOne({
    product: productId,
    user: userId,
  });
  if (existingReview) {
    throw new Error("review already exists for this product");
  }

  const review = await Review.create({
    product: productId,
    user: userId,
    order: verifiedOrder._id,
    rating,
    comment,
    verifiedPurchase: true,
  });

  return Review.findById(review._id).populate("user", "name avatar");
};

exports.update = async (request = {}) => {
  const { reviewId } = request.params;
  const { userId } = request.user || {};
  const { rating, comment } = request.body || {};

  const review = await Review.findById(reviewId);
  if (!review) throw new Error("review not found");
  if (String(review.user) !== String(userId)) {
    throw new Error("you can only update your own review");
  }

  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  await review.save();

  return Review.findById(review._id).populate("user", "name avatar");
};

exports.remove = async (request = {}) => {
  const { reviewId } = request.params;
  const { userId } = request.user || {};

  const review = await Review.findById(reviewId);
  if (!review) throw new Error("review not found");
  if (String(review.user) !== String(userId)) {
    throw new Error("you can only delete your own review");
  }

  await Review.findByIdAndDelete(reviewId);
  return { deleted: true };
};
