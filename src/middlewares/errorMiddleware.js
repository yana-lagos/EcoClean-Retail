const { ValidationError, UniqueConstraintError } = require("sequelize");

function errorMiddleware(err, req, res, next) {
  console.error("❌ Error capturado:", err.message);

  if (err instanceof ValidationError) {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({
      status: "error",
      message: "Error de validación.",
      data: messages,
    });
  }

  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      status: "error",
      message: "Ya existe un registro con esos datos únicos.",
      data: null,
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      status: "error",
      message: "El archivo supera el tamaño máximo permitido (5 MB).",
      data: null,
    });
  }

  if (err.message?.includes("Tipo de archivo no permitido")) {
    return res.status(400).json({
      status: "error",
      message: err.message,
      data: null,
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    status: "error",
    message: err.message || "Error interno del servidor.",
    data: null,
  });
}

module.exports = errorMiddleware;
