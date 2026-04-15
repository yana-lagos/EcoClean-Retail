require('dotenv').config();

const express = require("express");
const path = require("path");

const { sequelize } = require("./src/models");
const routes = require("./src/routes");
const loggerMiddleware = require("./src/middlewares/loggerMiddleware");
const errorMiddleware = require("./src/middlewares/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas públicas base
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Ruta /status
app.get("/status", (req, res) => {
  res.json({
    status: "ok",
    message: "Servidor RetailAseo en funcionamiento",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

app.use("/api", routes);

// Middleware de errores
app.use(errorMiddleware);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Conexión a PostgreSQL establecida.");

    await sequelize.sync({ alter: true });
    console.log("Modelos sincronizados exitósamente con la base de datos.");

    app.listen(PORT, () => {
      console.log(`\nServidor iniciado con éxito: http://localhost:${PORT}`);
      console.log(`Estado:            http://localhost:${PORT}/status`);
      console.log(`API:               http://localhost:${PORT}/api`);
      console.log(
        `Entorno:           ${process.env.NODE_ENV || "development"}\n`,
      );
    });
  } catch (err) {
    console.error("Error al iniciar el servidor:", err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
