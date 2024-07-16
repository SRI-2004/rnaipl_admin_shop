const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmployeeDetails = sequelize.define('EmployeeDetails', {
  SNo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Emp_Id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  Card_No: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true
  },
  Name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Gender: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Section: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Position: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ContactNo: {
    type: DataTypes.BIGINT,
    allowNull: false
  }
}, {
  tableName: 'employee_details',
  timestamps: false
});

module.exports = EmployeeDetails;
