const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Chat = require('./Chat');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  chatId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Chat,
      key: 'id'
    }
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sentAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true
});

// Establecer relaciones
Message.belongsTo(Chat, { foreignKey: 'chatId' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

Chat.hasMany(Message, { foreignKey: 'chatId' });
User.hasMany(Message, { as: 'sentMessages', foreignKey: 'senderId' });

module.exports = Message; 