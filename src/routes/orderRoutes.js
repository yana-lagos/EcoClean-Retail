const { Router } = require("express");
const ctrl = require("../controller/orderController");
const {
  authMiddleware,
  requireRole,
} = require("../middlewares/authMiddleware");

const router = Router();

router.use(authMiddleware);

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);

router.put("/:id/estado", requireRole("admin"), ctrl.updateEstado);

module.exports = router;
