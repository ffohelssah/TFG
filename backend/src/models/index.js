const User = require('./User');
const Card = require('./Card');
const Market = require('./Market');
const Chat = require('./Chat');
const Message = require('./Message');
const Trade = require('./Trade');

// Establecer todas las relaciones después de cargar todos los modelos

// User - Card relations
User.hasMany(Card, { foreignKey: 'userId' });
Card.belongsTo(User, { foreignKey: 'userId' });

// Market - Card relations
Market.belongsTo(Card, { foreignKey: 'cardId' });
Card.hasOne(Market, { foreignKey: 'cardId' });

// Market - User relations
Market.belongsTo(User, { as: 'seller', foreignKey: 'sellerId' });
User.hasMany(Market, { as: 'listings', foreignKey: 'sellerId' });

// Chat relations
Chat.belongsTo(User, { as: 'user1', foreignKey: 'userId1' });
Chat.belongsTo(User, { as: 'user2', foreignKey: 'userId2' });
Chat.belongsTo(Market, { foreignKey: 'marketId' });

User.hasMany(Chat, { as: 'chatsAsUser1', foreignKey: 'userId1' });
User.hasMany(Chat, { as: 'chatsAsUser2', foreignKey: 'userId2' });
Market.hasMany(Chat, { foreignKey: 'marketId' });

// Message relations
Message.belongsTo(Chat, { foreignKey: 'chatId', onDelete: 'CASCADE' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

Chat.hasMany(Message, { foreignKey: 'chatId', onDelete: 'CASCADE' });
User.hasMany(Message, { as: 'sentMessages', foreignKey: 'senderId' });

// Trade relations
Trade.belongsTo(Chat, { foreignKey: 'chatId', onDelete: 'CASCADE' });
Trade.belongsTo(Market, { foreignKey: 'marketId' });
Trade.belongsTo(User, { as: 'buyer', foreignKey: 'buyerId' });
Trade.belongsTo(User, { as: 'seller', foreignKey: 'sellerId' });
Trade.belongsTo(User, { as: 'rejectedByUser', foreignKey: 'rejectedBy' });

Chat.hasMany(Trade, { foreignKey: 'chatId', onDelete: 'CASCADE' });
Market.hasMany(Trade, { foreignKey: 'marketId' });
User.hasMany(Trade, { as: 'buyerTrades', foreignKey: 'buyerId' });
User.hasMany(Trade, { as: 'sellerTrades', foreignKey: 'sellerId' });

module.exports = {
  User,
  Card,
  Market,
  Chat,
  Message,
  Trade
}; 