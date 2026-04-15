const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      message: "Acceso denegado. Se requiere token de autenticación.",
      data: null,
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRETE);
    req.user = decoded;
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Token expirado. Por favor inicia sesión nuevamente."
        : "Token inválido.";

    return res.status(401).json({ status: "error", message, data: null });
  }
}

/**
 *@param {...string} roles
 */

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({
        status: "error",
        message: "No tienes permisos para realizar esta acción.",
        data: null,
      });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
