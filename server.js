require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

const app = express();

// ✅ CORS Configuration
app.use(cors({
  origin: [
    "http://localhost:8080",
    "http://localhost:3000",
    "http://localhost:5173",
    "https://v0-gold-front-end.vercel.app",
    "https://v0-gold-front-end-git-main-vijayj222003-7461s-projects.vercel.app",
    "*" // Allow all origins temporarily for testing
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Test route
app.get("/", (req, res) => {
  res.json({ message: "Gold Vault API is running!" });
});

// ✅ Import and use routes
const userRoutes = require("./routes/user.routes");
app.use("/api/users", userRoutes);

// ✅ 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ 
    message: "Route not found",
    path: req.originalUrl 
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Server start failed:", err);
    process.exit(1);
  }
};

startServer();