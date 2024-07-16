// models/supply_details.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SupplyDetails = sequelize.define('SupplyDetails', {
  SNo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Count: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  item_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  item_size: {
    type: DataTypes.STRING,
    allowNull: false
  },
  item_name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  Emp_Id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Card_No: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  Name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Gender: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Department_Contact: {
    type: DataTypes.BIGINT,
    allowNull: false
  }
}, {
  tableName: 'supply_details',
  timestamps: false
});

module.exports = SupplyDetails;
