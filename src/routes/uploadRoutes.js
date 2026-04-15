const { Router } = require("express");
const upload = require("../config/multer");
const ctrl = require("../controller/uploadController");
const {
  authMiddleware,
  requireRole,
} = require("../middlewares/authMiddleware");

const router = Router();

router.use(authMiddleware);

router.post("/avatar", upload.single("avatar"), ctrl.uploadAvatar);

router.post(
  "/product/:id",
  requireRole("admin"),
  upload.single("imagen"),
  ctrl.uploadProductImage,
);

module.exports = router;
