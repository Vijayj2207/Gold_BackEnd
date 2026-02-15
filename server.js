require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

const app = express();

// ✅ CORS Configuration - MUST be first
app.use(cors({
  origin: [
    "http://localhost:8080",
    "http://localhost:3000",
    "http://localhost:5173",
    "https://v0-gold-front-end.vercel.app",
    "https://v0-gold-front-end-git-main-vijayj222003-7461s-projects.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Body parsers - MUST be before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Import your routes (you need to create these)
const userRoutes = require("./routes/user.routes");

// ✅ Use routes
app.use("/api/users", userRoutes);

// ✅ Test route
app.get("/", (req, res) => {
  res.json({ message: "Gold Vault API is running!" });
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
  }
};

startServer();