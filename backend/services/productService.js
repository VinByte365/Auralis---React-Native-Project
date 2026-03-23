const Product = require("../models/productModel");
const Review = require("../models/reviewModel");
const { uploadImage, deleteAssets } = require("../utils/cloundinaryUtil");
const { createLog } = require("./activityLogsService");
const { sendPromotionNotificationToUsers } = require("./notificationService");
const slugify = require("slugify");

async function notifyPromotionForProduct(product, type = "promotion") {
  if (!product) return;

  const originalPrice = Number(product.price || 0);
  const discountedPrice = Number(product.salePrice || 0);
  const hasDiscount =
    Boolean(product.saleActive) &&
    Number.isFinite(discountedPrice) &&
    discountedPrice > 0 &&
    discountedPrice < originalPrice;

  if (!hasDiscount) return;

  const discountPercent =
    originalPrice > 0
      ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
      : 0;

  const title =
    type === "new_discount" ? "New Product Discount" : "Discount Updated";
  const body = `${product.name} is now ${discountPercent}% off. Tap to view details.`;

  try {
    const result = await sendPromotionNotificationToUsers({
      title,
      body,
      data: {
        screen: "NotificationDetails",
        params: {
          type: "promotion",
          title,
          message: body,
          productId: String(product._id),
          productName: product.name,
          oldPrice: String(originalPrice),
          newPrice: String(discountedPrice),
          discountPercent: String(discountPercent),
        },
        details: {
          productId: String(product._id),
          productName: product.name,
          originalPrice: String(originalPrice),
          salePrice: String(discountedPrice),
          discountPercent: String(discountPercent),
          discountAmount: String(originalPrice - discountedPrice),
          stock: String(product.stockQuantity || 0),
          category: String(product.category || ""),
          saleActive: Boolean(product.saleActive),
          type,
          updatedAt: new Date().toISOString(),
        },
      },
    });

    if (!result?.sent) {
      // Promotion broadcast skipped
    }
  } catch (error) {
    // Promotion broadcast failed
  }
}

const buildProductFilters = (query = {}) => {
  const { q, categoryId, priceGTE, priceLTE } = query;
  const filters = { deletedAt: null };

  if (q && q.trim()) {
    const searchTerm = q.trim();
    filters.$or = [
      { name: { $regex: searchTerm, $options: "i" } },
      { sku: { $regex: searchTerm, $options: "i" } },
      { barcode: { $regex: searchTerm, $options: "i" } },
    ];
  }

  if (categoryId) {
    filters.category = categoryId;
  }

  if (priceGTE !== undefined || priceLTE !== undefined) {
    filters.price = {};
    if (priceGTE !== undefined && priceGTE !== "") {
      filters.price.$gte = Number(priceGTE);
    }
    if (priceLTE !== undefined && priceLTE !== "") {
      filters.price.$lte = Number(priceLTE);
    }

    if (Object.keys(filters.price).length === 0) {
      delete filters.price;
    }
  }

  return filters;
};

const create = async (request) => {
  if (!request.body) throw new Error(`theres no payload`);
  let newImages = [];
  if (request.files && request.files.length > 0) {
    let temp = await uploadImage(request.files, "products");
    newImages = Array.isArray(temp) ? temp : [temp];
  }
  request.body.images = newImages;
  let slug = slugify(request.body.name);
  request.body.slug = slug;
  const product = await Product.create(request.body);
  if (!product) {
    createLog(
      request.user.userId,
      "CREATE_PRODUCT",
      "FAILED",
      `Failed to create new product named '${request.body.name}'`,
    );
    throw new Error("failed to create the product");
  }
  createLog(
    request.user.userId,
    "CREATE_PRODUCT",
    "SUCCESS",
    `create a new product named '${product.name}'`,
  );

  await notifyPromotionForProduct(product, "new_discount");
  //
  return product;
};

const getAll = async (request) => {
  const { minRating } = request.query || {};
  const filters = buildProductFilters(request.query || {});

  const normalizedMinRating = Number(minRating);
  if (Number.isFinite(normalizedMinRating) && normalizedMinRating > 0) {
    const ratingMatches = await Review.aggregate([
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
        },
      },
      {
        $match: {
          averageRating: { $gte: normalizedMinRating },
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]);

    filters._id = {
      $in: ratingMatches.map((item) => item._id),
    };
  }

  const products = await Product.find(filters)
    .populate("category")
    .sort({ createdAt: -1 });
  return products;
};

const getById = async (request = {}) => {
  const { productId } = request.params;
  const product = await Product.findById(productId).populate("category");
  if (!product) throw new Error("product is not found");
  return product;
};

const search = async (request = {}) => {
  const { q } = request.query;
  if (!q || q.trim().length < 2) {
    return { products: [] };
  }

  const searchTerm = q.trim();
  const products = await Product.find({
    deletedAt: null,
    $or: [
      { barcode: { $regex: searchTerm, $options: "i" } },
      { name: { $regex: searchTerm, $options: "i" } },
      { sku: { $regex: searchTerm, $options: "i" } },
    ],
  })
    .populate("category")
    .limit(20)
    .select("_id name barcode sku price stockQuantity images category");

  return { products };
};

const getBarcode = async (request = {}) => {
  const { barcode } = request.query;
  if (!barcode) throw new Error("barcode is required");

  const product = await Product.findOne({
    barcode: String(barcode).trim(),
    deletedAt: null,
  }).populate("category");

  if (!product) throw new Error("product is not found");
  return product;
};

const update = async (request = {}) => {
  const { productId } = request.params;

  if (!request.body) throw new Error("unefined request body");
  let newImages = [];
  if (request.files && request.files.length > 0) {
    let temp = await uploadImage(request.files, "products");
    newImages = Array.isArray(temp) ? temp : [temp];
  }

  const safeBody = {
    ...(request.body || {}),
  };
  delete safeBody.images;

  const updateQuery = {
    ...safeBody,
    deletedAt: null,
  };

  if (safeBody.discountScopes) {
    updateQuery.discountScopes = String(safeBody.discountScopes).split(",");
  }
  if (newImages.length > 0) {
    updateQuery.$push = {
      images: { $each: newImages },
    };
  }
  const product = await Product.findByIdAndUpdate(productId, updateQuery, {
    new: true,
    upsert: true,
    runValidators: true,
  });

  if (!product) {
    createLog(
      request.user.userId,
      "CREATE_PRODUCT",
      "FAILED",
      `Failed to update the product named '${request?.body?.name || productId}'`,
    );
    throw new Error("failed to update the product");
  }
  createLog(
    request.user.userId,
    "UPDATE_PRODUCT",
    "SUCCESS",
    `updated the product named '${product.name}'`,
  );

  const isDiscountMutation =
    Object.prototype.hasOwnProperty.call(safeBody, "salePrice") ||
    Object.prototype.hasOwnProperty.call(safeBody, "saleActive");

  if (isDiscountMutation) {
    await notifyPromotionForProduct(product, "promotion_update");
  }

  return product;
};

const removeImg = async (request) => {
  const { publicId } = request.query;
  const { productId } = request.params;
  const result = await deleteAssets([publicId]);
  const deletionStatus = result?.deleted?.[publicId];
  if (deletionStatus !== "deleted" && deletionStatus !== "not_found") {
    throw new Error("failed to delete image from Cloudinary");
  }
  if (!result) throw new Error("failed to delete the image");
  const updateProductImage = await Product.findById(productId);
  updateProductImage.images = updateProductImage.images.filter(
    (image) => image.public_id !== publicId,
  );
  await updateProductImage.save();

  return deletionStatus;
};

const softDelete = async (request) => {
  const { productId } = request.params;
  const now = new Date();
  const isUpdated = await Product.findByIdAndUpdate(
    productId,
    {
      deletedAt: now,
    },
    { new: true },
  );

  if (!isUpdated) {
    createLog(
      request.user.userId,
      "TEMPORARY_DELETE",
      "FAILED",
      `Failed to temporarily delete the product with ID:'${productId}'`,
    );
    throw new Error("failed to temporarily delete the product");
  }

  createLog(
    request.user.userId,
    "TEMPORARY_DELETE",
    "SUCCESS",
    `Failed to temporarily delete the product named '${isUpdated.name}'`,
  );

  return isUpdated;
};

const restore = async (request) => {
  const { productId } = request.params;
  const restoredProduct = await Product.findByIdAndUpdate(
    productId,
    {
      deletedAt: null,
    },
    { new: true, runValidators: true },
  );

  if (!restoredProduct) {
    createLog(
      request.user.userId,
      "RESTORE_PRODUCT",
      "FAILED",
      `Failed to restore the product the with the ID: '${productId}'`,
    );
    throw new Error("failed to restore the product");
  }
  createLog(
    request.user.userId,
    "RESTORE_PRODUCT",
    "SUCCESS",
    `Successfully restored the deleted product named '${restoredProduct.name}'`,
  );

  return true;
};

const hardDelete = async (request) => {
  const { productId } = request.params;
  const deletedProduct = await Product.findByIdAndDelete(productId);
  if (!deletedProduct) {
    createLog(
      request.user.userId,
      "PERMANENT_DELETE",
      "FAILED",
      `Failed to permanently delete the product with ID:'${productId}'`,
    );
    throw new Error("failed to delete the product");
  }
  if (deletedProduct.images) {
    const publicIds = deletedProduct.map((image) => image.public_id);
    const imageDeleted = deleteAssets(publicIds);
  }
  createLog(
    request.user.userId,
    "PERMANENT_DELETE",
    "SUCCESS",
    `Permanently deleted the product named '${deletedProduct.name}'`,
  );

  return deletedProduct;
};

const updateStock = async (request) => {
  if (!request.body) throw new Error("undefined request body");
  const { productId } = request.params;
  const isUpdated = await Product.findByIdAndUpdate(productId, request.body, {
    new: true,
  });
  if (isUpdated) {
  }
  return isUpdated;
};

module.exports = {
  create,
  getAll,
  getById,
  search,
  update,
  removeImg,
  softDelete,
  hardDelete,
  restore,
  updateStock,
  getBarcode,
};
