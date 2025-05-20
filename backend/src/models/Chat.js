const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Market = require('./Market');

const Chat = sequelize.define('Chat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId1: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  userId2: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  marketId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Market,
      key: 'id'
    }
  },
  roomId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastActivity: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true
});

// Establecer relaciones
Chat.belongsTo(User, { as: 'user1', foreignKey: 'userId1' });
Chat.belongsTo(User, { as: 'user2', foreignKey: 'userId2' });
Chat.belongsTo(Market, { foreignKey: 'marketId' });

User.hasMany(Chat, { as: 'chatsAsUser1', foreignKey: 'userId1' });
User.hasMany(Chat, { as: 'chatsAsUser2', foreignKey: 'userId2' });
Market.hasMany(Chat, { foreignKey: 'marketId' });

module.exports = Chat; 