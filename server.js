require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

const app = express();

// ✅ CORS Configuration
app.use(cors({
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Health check routes - MUST respond quickly
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "Gold Vault API is running!",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ✅ Import and use routes
try {
  const userRoutes = require("./routes/user.routes");
  app.use("/api/users", userRoutes);
  console.log("✅ Routes loaded successfully");
} catch (error) {
  console.error("❌ Failed to load routes:", error);
}

// ✅ 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ 
    message: "Route not found",
    path: req.originalUrl 
  });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ 
    message: "Internal server error"
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("🚀 Starting server...");
    console.log("📍 Port:", PORT);
    console.log("🌍 Environment:", process.env.NODE_ENV || "development");
    
    // Start server FIRST, then connect to DB
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Server is listening on 0.0.0.0:${PORT}`);
      
      // Connect to database AFTER server starts
      connectDB()
        .then(() => {
          console.log("✅ Database connection completed");
        })
        .catch((err) => {
          console.error("⚠️ Database connection failed but server continues:", err.message);
        });
    });

    // Keep-alive to prevent idle timeout
    setInterval(() => {
      console.log("💓 Server heartbeat");
    }, 30000); // every 30 seconds

    // Handle graceful shutdown
    const shutdown = (signal) => {
      console.log(`⚠️ ${signal} received, shutting down gracefully`);
      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
      
      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error("⚠️ Forced shutdown");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
    
  } catch (err) {
    console.error("❌ Server start failed:", err);
    process.exit(1);
  }
};

startServer();

// Handle uncaught errors but don't exit
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});