const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require("./user.model")(sequelize, DataTypes);

module.exports = db;
