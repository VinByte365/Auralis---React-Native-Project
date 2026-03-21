const { Expo } = require("expo-server-sdk");
const User = require("../models/userModel");
const expo = new Expo();

async function sendPushToUser(pushToken, title = "Auralis", body, data = {}) {
  const token = String(pushToken || "").trim();
  if (!token) {
    return { sent: false, reason: "missing_push_token" };
  }

  if (!Expo.isExpoPushToken(token)) {
    return { sent: false, reason: "invalid_expo_push_token", token };
  }

  const message = [
    {
      to: token,
      sound: "default",
      title,
      body,
      data,
    },
  ];

  const chunks = expo.chunkPushNotifications(message);
  const tickets = [];

  for (const chunk of chunks) {
    const chunkTickets = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...chunkTickets);
  }

  return {
    sent: true,
    tickets,
  };
}

function extractPushToken(user) {
  if (!user) return "";
  if (typeof user.pushToken === "string") return user.pushToken;
  if (typeof user?.pushToken?.token === "string") return user.pushToken.token;
  return "";
}

async function sendPromotionNotificationToUsers({
  title = "Auralis Promotion",
  body = "A new discount is available.",
  data = {},
  userFilter = {},
} = {}) {
  const users = await User.find({
    role: { $ne: "admin" },
    ...userFilter,
  }).select("pushToken");

  const validTokens = users
    .map((user) => String(extractPushToken(user) || "").trim())
    .filter((token) => Expo.isExpoPushToken(token));

  const uniqueTokens = [...new Set(validTokens)];

  if (uniqueTokens.length === 0) {
    return {
      sent: false,
      reason: "no_valid_push_tokens",
      attemptedUsers: users.length,
    };
  }

  const messages = uniqueTokens.map((token) => ({
    to: token,
    sound: "default",
    title,
    body,
    data,
  }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  for (const chunk of chunks) {
    const chunkTickets = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...chunkTickets);
  }

  return {
    sent: true,
    attemptedUsers: users.length,
    successfulTokens: uniqueTokens.length,
    deduplicatedTokens: validTokens.length - uniqueTokens.length,
    tickets,
  };
}

module.exports = {
  sendPushToUser,
  sendPromotionNotificationToUsers,
};
