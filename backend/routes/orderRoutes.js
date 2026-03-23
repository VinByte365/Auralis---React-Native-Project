const express = require("express");
const router = express.Router();
const authMiddlware = require("../middlewares/authMiddleware");
const orderController = require("../controllers/orderController");

router
  .route("/orders")
  .get(authMiddlware.verifyToken, orderController.getUser_OrderList);

router
  .route("/confirmOrder")
  .post(authMiddlware.verifyToken, orderController.confirmOrder);

router
  .route("/orders/:orderId/status")
  .put(authMiddlware.verifyToken, orderController.updateOrderStatus);
router
  .route("/orders/:orderId")
  .get(authMiddlware.verifyToken, orderController.getOrderById);

module.exports = router;
