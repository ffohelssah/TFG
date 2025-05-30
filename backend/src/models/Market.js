const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Card = require('./Card');
const User = require('./User');

const Market = sequelize.define('Market', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cardId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Card,
      key: 'id'
    }
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('available', 'pending', 'sold'),
    defaultValue: 'available'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  listedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true
});

// Relaciones definidas en models/index.js

module.exports = Market; 