const { Router } = require("express");
const ctrl = require("../controller/categoryController");
const {
  authMiddleware,
  requireRole,
} = require("../middlewares/authMiddleware");

const router = Router();

// Rutas públicas
router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);

// Rutas protegidas
router.post("/", authMiddleware, requireRole("admin"), ctrl.create);
router.put("/:id", authMiddleware, requireRole("admin"), ctrl.update);
router.delete("/:id", authMiddleware, requireRole("admin"), ctrl.remove);

module.exports = router;
