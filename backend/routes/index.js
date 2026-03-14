const product = require("./productRoute");
const auth = require("./authRoute");
const user = require("./userRoute");
const category = require("./categoryRoute");
const activityLogs = require("./activityLogsRoute");
const order = require("./orderRoutes");
const adminDashboard = require("./adminDashboardRoute");
const storeSettings = require("./storeSettingsRoute");

module.exports = {
  product,
  auth,
  user,
  category,
  order,
  activityLogs,
  adminDashboard,
  storeSettings,
};
