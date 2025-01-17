// models/Admin.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Admin = sequelize.define('Admin', {
  SNo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Name: {
  //   type: DataTypes.STRING,
  //   allowNull: false
  // },
  // ContactNo: {
  //   type: DataTypes.BIGINT,
  //   allowNull: false
  // },
  // is_Admin: {
  //   type: DataTypes.BOOLEAN,
  //   allowNull: false
  // },
  Emp_Id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  Card_No: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  Password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'admin',
  timestamps: false
});

module.exports = Admin;
