const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router
  .route("/profile/user/:userId")
  .put(
    authMiddleware.verifyToken,
    upload.single("avatar"),
    userController.updateProfile,
  );

router
  .route("/user")
  .get(
    authMiddleware.verifyToken,
    authMiddleware.roleAccess("admin"),
    userController.getAllUser,
  )
  .post(
    upload.single("avatar"),
    authMiddleware.verifyToken,
    authMiddleware.roleAccess("admin"),
    userController.createUser,
  );

router
  .route("/user/:userId")
  .get(
    authMiddleware.verifyToken,
    authMiddleware.roleAccess("admin"),
    userController.getUserById,
  )
  .put(
    upload.single("avatar"),
    authMiddleware.verifyToken,
    authMiddleware.roleAccess("admin"),
    userController.updateProfile,
  )
  .delete(
    authMiddleware.verifyToken,
    authMiddleware.roleAccess("admin"),
    userController.deleteUser,
  );

router
  .route("/user/roles/:userId")
  .put(
    authMiddleware.verifyToken,
    authMiddleware.roleAccess("admin"),
    userController.updatePermission,
  );

router
  .route("/customer/home")
  .get(authMiddleware.verifyToken, userController.userHomeData);

router
  .route("/user/push-token")
  .post(authMiddleware.verifyToken, userController.addPushToken)
  .delete(authMiddleware.verifyToken, userController.removePushToken);

module.exports = router;
