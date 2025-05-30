const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Trade = sequelize.define('Trade', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  chatId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Chats',
      key: 'id'
    }
  },
  marketId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Markets',
      key: 'id'
    }
  },
  buyerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'buyer_accepted', 'seller_accepted', 'both_accepted', 'completed', 'rejected'),
    defaultValue: 'pending'
  },
  buyerAccepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sellerAccepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  buyerAcceptedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sellerAcceptedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejectedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejectedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'Trades',
  timestamps: true
});

module.exports = Trade; 