const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust the path as necessary

const ItemPosition = sequelize.define('ItemPosition', {
  item_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  item_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  position: {
    type: DataTypes.STRING, // You can change this to INTEGER if it's a numeric position
    allowNull: false
  },
  department: {
    type: DataTypes.STRING, // You can change this to INTEGER if it's a numeric position
    allowNull: false
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  tableName: 'item_positions', // Adjust the table name if needed
  timestamps: false 
});

module.exports = ItemPosition;
