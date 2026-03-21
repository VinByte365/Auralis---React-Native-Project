const express = require("express");
const router = express.Router();
const promoController = require("../controllers/promoController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware.verifyToken);
router.use(authMiddleware.roleAccess("admin"));

router
  .route("/promo")
  .get(promoController.getAllPromos)
  .post(promoController.createPromo);

router
  .route("/promo/:promoId")
  .put(promoController.updatePromo)
  .delete(promoController.deletePromo);

module.exports = router;
