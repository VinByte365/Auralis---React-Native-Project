const { Expo } = require("expo-server-sdk");
const User = require("../models/userModel");
const expo = new Expo();

/**
 * Generate unique notification ID
 */
function generateNotificationId() {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Build notification data payload with all details
 */
function buildNotificationData({
  screen,
  params = {},
  details = {},
  actions = [],
  notificationId = null,
  timestamp = null,
} = {}) {
  return {
    screen: screen || "NotificationDetails",
    params: typeof params === "string" ? params : JSON.stringify(params),
    details: typeof details === "string" ? details : JSON.stringify(details),
    actions: Array.isArray(actions) ? JSON.stringify(actions) : "[]",
    notificationId: notificationId || generateNotificationId(),
    timestamp: timestamp || new Date().toISOString(),
  };
}

async function sendPushToUser(
  pushToken,
  title = "Auralis",
  body,
  data = {},
  options = {},
) {
  const token = String(pushToken || "").trim();
  if (!token) {
    return { sent: false, reason: "missing_push_token" };
  }

  if (!Expo.isExpoPushToken(token)) {
    return { sent: false, reason: "invalid_expo_push_token", token };
  }

  const {
    sound = "default",
    badge = 1,
    priority = "high",
    mutableContent = true,
  } = options;

  const message = [
    {
      to: token,
      sound,
      badge,
      title,
      body,
      data: buildNotificationData(data),
      priority,
      mutableContent,
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
    notificationId: data?.notificationId || generateNotificationId(),
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
  options = {},
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

  const {
    sound = "default",
    badge = 1,
    priority = "high",
    mutableContent = true,
  } = options;

  const messages = uniqueTokens.map((token) => ({
    to: token,
    sound,
    badge,
    title,
    body,
    data: buildNotificationData(data),
    priority,
    mutableContent,
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
    notificationId: data?.notificationId || generateNotificationId(),
  };
}

module.exports = {
  sendPushToUser,
  sendPromotionNotificationToUsers,
  buildNotificationData,
  generateNotificationId,
};
