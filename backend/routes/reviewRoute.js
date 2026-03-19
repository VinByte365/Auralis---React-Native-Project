const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middlewares/authMiddleware");

router
  .route("/reviews/product/:productId")
  .get(reviewController.listProductReviews);

router
  .route("/reviews")
  .post(authMiddleware.verifyToken, reviewController.createReview);

router
  .route("/reviews/:reviewId")
  .put(authMiddleware.verifyToken, reviewController.updateReview)
  .delete(authMiddleware.verifyToken, reviewController.deleteReview);

module.exports = router;
