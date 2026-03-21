const { Expo } = require("expo-server-sdk");
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

module.exports = {
  sendPushToUser,
};
