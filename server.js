const express = require("express");
const { connectDB } = require("./config/db");

const app = express();

const PORT = process.env.PORT || 8080;

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
