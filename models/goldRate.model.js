const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const GoldRate = sequelize.define('GoldRate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Gold rate per gram in rupees'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true,
    comment: 'Date for this gold rate'
  },
  change: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Change from previous day'
  },
  changePercentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: 'Percentage change from previous day'
  }
}, {
  tableName: 'gold_rates',
  timestamps: true
});

module.exports = GoldRate;