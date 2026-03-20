const User = require("../models/userModel");
const { uploadImage, deleteAssets } = require("../utils/cloundinaryUtil");
const Order = require("../models/orderModel");
const { createLog } = require("../services/activityLogsService");

exports.update = async (request) => {
  const { userId } = request.params;
  if (!request.body) throw new Error("undefined request content");
  if (request.file)
    request.body.avatar = await uploadImage([request.file], "users");
  const user = await User.findByIdAndUpdate(userId, request.body, {
    runValidators: true,
  });
  if (user?.avatar?.public_id) deleteAssets([user.avatar.public_id]);
  if (!user) {
    createLog(
      request.user.userId,
      "UPDATE_USER",
      "FAILED",
      `Failed to update user with ID ${userId} `,
    );
    throw new Error("failed to update the user");
  }
  createLog(
    request.user.userId,
    "UPDATE_USER",
    "SUCCESS",
    `Successfully updated user with ID ${userId} `,
  );
  return user;
};

exports.getAll = async (request) => {
  const { userId } = request.user;
  const users = await User.find({ userId: { $ne: userId } });
  return users;
};

exports.getById = async (request) => {
  const { userId } = request.params;
  const user = await User.findById(userId);
  if (!user) throw new Error("user is not found in the collection");
  return user;
};

exports.create = async (request) => {
  if (!request.body) throw new Error("empty body object");
  const data = { ...request.body };
  const user = await User.create(data);
  if (!user) throw new Error("failed to create the user");
  return user;
};

exports.delete = async (request) => {
  const { userId } = request.params;
  const isDeleted = await User.findByIdAndDelete(userId);
  if (!isDeleted) {
    createLog(
      request.user.userId,
      "DELETE_USER",
      "FAILED",
      `Failed to delete user with ID ${userId} `,
    );
    throw new Error("failed to delete the user");
  }
  deleteAssets([isDeleted.avatar.public_id]);
  createLog(
    request.user.userId,
    "DELETE_USER",
    "SUCCESS",
    `Successfully delete user named ${isDeleted.name}`,
  );
  return;
};

exports.rolesAndPermission = async (request) => {
  if (!request.body) throw new Error("undefined body");
  const { userId } = request.params;
  const user = await User.findByIdAndUpdate(userId, request.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    createLog(
      request.user.userId,
      "CHANGE_PERMISSION",
      "FAILED",
      `Failed to update user's permission with ID ${userId} `,
    );
    throw new error("failed to update the user permission");
  }
  createLog(
    request.user.userId,
    "CHANGE_PERMISSION",
    "SUCCESS",
    `Successfully updated ${user.name} permission with ID ${userId} `,
  );
  return user;
};

exports.getHomeScreenData = async (request) => {
  const { userId } = request.user;
  const [userInfo, orderCount] = await Promise.all([
    User.findById(userId).lean(),
    Order.find({ user: userId }).countDocuments(),
  ]);

  const user = {
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
    loyaltyPoints: userInfo.loyaltyPoints || 0,
    orderCount,
  };
  // console.log(user);
  return user;
};

exports.addPushToken = async (request) => {
  const { userId } = request.user || {};
  const { token, platform = "unknown" } = request.body || {};

  if (!userId) throw new Error("missing authenticated user");
  if (!token) throw new Error("push token is required");

  const user = await User.findById(userId);
  if (!user) throw new Error("failed to find the user");

  user.pushToken = {
    token,
    platform,
    lastUpdate: Date.now(),
  };

  await user.save();

  return user.pushToken;
};

exports.removePushToken = async (request) => {
  const { userId } = request.user || {};
  if (!userId) throw new Error("missing authenticated user");

  const user = await User.findById(userId);
  if (!user) throw new Error("failed to find the user");

  user.pushToken = undefined;
  await user.save();

  return { removed: true };
};
