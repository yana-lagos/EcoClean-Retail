const { Router } = require("express");
const { register, login, getMe } = require("../controller/authController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = Router();

// Rutas públicas
router.post("/register", register);
router.post("/login", login);

// Ruta protegida
router.get("/me", authMiddleware, getMe);

module.exports = router;
