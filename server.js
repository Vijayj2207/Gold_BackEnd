require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

const app = express();

/* =========================
   CORS
========================= */
const corsOptions = {
  origin: "*",
  credentials: false, // ✅ must be false when origin is "*"
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ✅ handle preflight

/* =========================
   BODY PARSERS
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   ROUTES
========================= */
const userRoutes = require("./routes/user.routes");
const customerRoutes = require("./routes/customer.routes.js"); // ✅ removed .ts
const goldRateRoutes = require("./routes/goldRate.routes"); // ✅ removed .js
const depositRoutes = require("./routes/deposit.routes"); // ✅ removed .js
const paymentRoutes = require("./routes/payment.route.js"); // ✅ fixed name

app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/gold-rate", goldRateRoutes);
app.use("/api/deposits", depositRoutes);
app.use("/api/payments", paymentRoutes);

console.log("✅ Routes registered successfully");

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Gold Vault API is running!",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

/* =========================
   404 HANDLER
========================= */
app.use("*", (req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({ message: "Internal server error" });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);

      connectDB()
        .then(() => console.log("✅ Database connected"))
        .catch((err) => console.error("⚠️ DB connection failed:", err.message));
    });

    process.on("SIGTERM", () => {
      console.log("⚠️ SIGTERM received, shutting down...");
      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("⚠️ SIGINT received, shutting down...");
      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
    });
  } catch (err) {
    console.error("❌ Server start failed:", err);
    process.exit(1);
  }
};

startServer();

/* =========================
   GLOBAL ERROR HANDLERS
========================= */
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});
