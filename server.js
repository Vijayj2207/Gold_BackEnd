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

// ✅ Health check routes
app.get("/", (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.status(200).json({ 
    message: "Gold Vault API is running!",
    status: "healthy",
    timestamp: new Date().toISOString(),
    registeredRoutes: routes
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ✅ Import and use routes
console.log("📂 Loading routes...");
try {
  const userRoutes = require("./routes/user.routes");
  console.log("✅ Routes module loaded, type:", typeof userRoutes);
  console.log("✅ Routes object:", userRoutes);
  
  // Check if it's a function (router) or object
  if (typeof userRoutes === 'function') {
    app.use("/api/users", userRoutes);
    console.log("✅ Routes mounted at /api/users");
  } else {
    console.error("❌ userRoutes is not a function/router!");
  }
} catch (error) {
  console.error("❌ Failed to load routes:");
  console.error("   Message:", error.message);
  console.error("   Stack:", error.stack);
}

// Log all routes after registration
console.log("\n📋 All registered routes:");
app._router.stack.forEach((r, i) => {
  if (r.route) {
    console.log(`   ${i}. ${Object.keys(r.route.methods).join(", ").toUpperCase()} ${r.route.path}`);
  } else if (r.name === "router") {
    console.log(`   ${i}. Router: ${r.regexp}`);
    if (r.handle && r.handle.stack) {
      r.handle.stack.forEach((handler, j) => {
        if (handler.route) {
          console.log(`      ${i}.${j}. ${Object.keys(handler.route.methods).join(", ").toUpperCase()} ${handler.route.path}`);
        }
      });
    }
  }
});
console.log("");

// ✅ 404 handler
app.use("*", (req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: "Route not found",
    path: req.originalUrl,
    method: req.method
  });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
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
    
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Server is listening on 0.0.0.0:${PORT}`);
      
      connectDB()
        .then(() => {
          console.log("✅ Database connection completed");
        })
        .catch((err) => {
          console.error("⚠️ Database connection failed:", err.message);
        });
    });

    setInterval(() => {
      console.log("💓 Server heartbeat");
    }, 30000);

    const shutdown = (signal) => {
      console.log(`⚠️ ${signal} received, shutting down gracefully`);
      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
      
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

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});