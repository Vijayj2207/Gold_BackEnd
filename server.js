require("dotenv").config();

const app = require("./app");
const { connectDB, sequelize } = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server start failed:", error);
  }
};

startServer();
