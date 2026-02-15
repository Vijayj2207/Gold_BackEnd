require("dotenv").config();
const { Sequelize } = require("sequelize");

let sequelize;

if (process.env.DATABASE_URL) {
  // ✅ Production (Railway)
  console.log("📦 Using DATABASE_URL for connection");
  
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      connectTimeout: 60000, // 60 seconds
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // ✅ Local development
  console.log("📦 Using local DB credentials");
  
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: "mysql",
      logging: false,
    }
  );
}

const connectDB = async () => {
  try {
    console.log("🔌 Attempting database connection...");
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error("Full error:", error);
    
    // Don't exit immediately - let Railway restart
    throw error;
  }
};

module.exports = { sequelize, connectDB };