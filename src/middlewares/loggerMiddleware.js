const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "../../logs");
const logFile = path.join(logsDir, "log.txt");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

function loggerMiddleware(req, res, next) {
  const now = new Date();
  const fecha = now.toLocaleDateString("es-CL");
  const hora = now.toLocaleTimeString("es-CL");
  const ip = req.ip || req.connection.remoteAddress || "desconocida";
  const linea = `[${fecha} ${hora}] ${req.method.padEnd(6)} ${req.originalUrl} — IP: ${ip}\n`;

  fs.appendFile(logFile, linea, (err) => {
    if (err) console.error("⚠️  Error escribiendo log:", err.message);
  });

  next();
}

module.exports = loggerMiddleware;
