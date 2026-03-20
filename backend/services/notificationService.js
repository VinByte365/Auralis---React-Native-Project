const { Expo } = require("expo-server-sdk");
const User = require("../models/userModel")
const expo = new Expo();

async function sendPushToUser(pushToken, title = "Auralis", body, data = {}) {
  if (!Expo.isExpoPushToken(pushToken)) return;

  const message = [
    {
      to: pushToken,
      sound: "default",
      title,
      body,
      data,
    },
  ];

  const chunks = expo.chunkPushNotifications(message);
  for (const chunk of chunks) await expo.sendPushNotificationsAsync(chunk);
}

module.exports = {
  sendPushToUser,
};
