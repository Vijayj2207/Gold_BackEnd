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

// ✅ Health check routes - CRITICAL for Railway
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
  const userRoutes = require("./routes/userRoutes");
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
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("🚀 Starting server...");
    console.log("📍 Port:", PORT);
    console.log("🌍 Environment:", process.env.NODE_ENV || "development");
    
    // Connect to database first
    await connectDB();
    
    // CRITICAL: Bind to 0.0.0.0 for Railway
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Server is listening on 0.0.0.0:${PORT}`);
    });

    // Handle graceful shutdown
    process.on("SIGTERM", () => {
      console.log("⚠️ SIGTERM received, shutting down gracefully");
      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("⚠️ SIGINT received, shutting down gracefully");
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

// Handle uncaught errors
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});