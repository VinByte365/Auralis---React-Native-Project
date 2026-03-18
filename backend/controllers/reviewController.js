const reviewService = require("../services/reviewService");
const controllerWrapper = require("../utils/controllerWrapper");

exports.listProductReviews = controllerWrapper(reviewService.listByProduct);
exports.createReview = controllerWrapper(reviewService.create);
exports.updateReview = controllerWrapper(reviewService.update);
exports.deleteReview = controllerWrapper(reviewService.remove);
