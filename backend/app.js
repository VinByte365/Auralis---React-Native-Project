const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const {
  product,
  auth,
  user,
  category,
  activityLogs,
  order,
  adminDashboard,
  storeSettings,
} = require("./routes/index");
const productModel = require("./models/productModel");

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8081",
  "http://192.168.1.11:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow mobile apps / Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

//registered Routes
app.use("/api/v1", product);
app.use("/api/v1", auth);
app.use("/api/v1", user);
app.use("/api/v1", category);
app.use("/api/v1", order);
app.use("/api/v1/logs", activityLogs);
app.use("/api/v1/admin", adminDashboard);
app.use("/api/v1/admin/settings", storeSettings);

module.exports = app;
