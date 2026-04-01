const Category = require("../models/categoryModel");
const { createLog } = require("./activityLogsService");
const { getCache, setCache, deleteCached } = require("../cache/cache.service");

exports.list = async () => {
  const categories = null;
  const cached = await getCache("categories");
  if (!cached) return cached;

  categories = await Category.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "category",
        as: "products",
      },
    },
    {
      $project: {
        categoryName: 1,
        isBNPC: 1,
        bnpcCategory: 1,
        applicableTo: 1,
        count: { $size: "$products" },
      },
    },
    {
      $sort: { categoryName: 1 },
    },
  ]);
  return categories;
};

exports.create = async (request) => {
  if (!request.body) throw new Error("undefined request body");
  const { categories } = request.body;
  if (!Array.isArray(categories)) {
    createLog(
      request.user.userId,
      "CREATE_CATEGORY",
      "FAILED",
      `Failed to create category/categories`,
    );
    throw new Error("categories must be array object type");
  }
  const result = await Category.insertMany(categories, { ordered: false });
  createLog(
    request.user.userId,
    "CREATE_CATEGORY",
    "SUCCESS",
    `Successfully created the category/categories`,
  );

  deleteCached("categories");
  return result;
};

exports.update = async (request) => {
  const { categoryId } = request.params;
  if (!request.body) throw new Error("undefined request body");
  const updateCategory = await Category.findByIdAndUpdate(
    categoryId,
    request.body.categoryData,
    { returnDocument: "after" },
  );

  if (!updateCategory) {
    createLog(
      request.user.userId,
      "UPDATE_CATEGORY",
      "SUCCESS",
      `Failed to update the category with the ID: ${categoryId}`,
    );
    throw new Error("failed to update the category");
  }

  deleteCached("categories");

  createLog(
    request.user.userId,
    "UPDATE_CATEGORY",
    "SUCCESS",
    `Successfully updated the ${updateCategory.categoryName}`,
  );
  return updateCategory;
};

exports.delete = async (request) => {
  const { categoryId } = request.params;
  if (!categoryId) throw new Error("undefined category id");
  const deleteCategory = await Category.findByIdAndDelete(categoryId);
  if (!deleteCategory) {
    createLog(
      request.user.userId,
      "DELETE_CATEGORY",
      "FAILED",
      `Successfully deleted the category with the ID ${categoryId}`,
    );
    throw new Error("failed to delete the category");
  }
  createLog(
    request.user.userId,
    "DELETE_CATEGORY",
    "SUCCESS",
    `Successfully deleted ${deleteCategory.categoryName}`,
  );

  deleteCached("categories");
  return deleteCategory;
};
