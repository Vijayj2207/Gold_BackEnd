const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "mysql",
  logging: false,
});

const connectDB = async () => {
  try {
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Unable to connect to database:", error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
