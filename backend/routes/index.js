const product = require("./productRoute");
const auth = require("./authRoute");
const user = require("./userRoute");
const category = require("./categoryRoute");
const activityLogs = require("./activityLogsRoute");
const order = require("./orderRoutes");
const adminDashboard = require("./adminDashboardRoute");
const promo = require("./promoRoute");
const storeSettings = require("./storeSettingsRoute");
const review = require("./reviewRoute");

module.exports = {
  product,
  auth,
  user,
  category,
  order,
  review,
  activityLogs,
  adminDashboard,
  storeSettings,
  promo,
};
