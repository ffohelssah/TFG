// ================================================================================================
// MODELOS Y RELACIONES DE BASE DE DATOS - SEQUELIZE ORM
// ================================================================================================
// Este archivo centraliza todos los modelos de Sequelize y define las relaciones entre ellos.
// 
// ESTRUCTURA DE LA BASE DE DATOS:
// 1. User - Usuarios del sistema
// 2. Card - Cartas que poseen los usuarios
// 3. Market - Listados de cartas en venta
// 4. Chat - Conversaciones entre usuarios
// 5. Message - Mensajes individuales en los chats
// 6. Trade - Transacciones de intercambio
// ================================================================================================

// ============================================================================================
// IMPORTACIÓN DE MODELOS
// ============================================================================================
const User = require('./User');         // Modelo de usuarios
const Card = require('./Card');         // Modelo de cartas
const Market = require('./Market');     // Modelo de listados del mercado
const Chat = require('./Chat');         // Modelo de conversaciones
const Message = require('./Message');   // Modelo de mensajes
const Trade = require('./Trade');       // Modelo de transacciones

// ============================================================================================
// RELACIONES ENTRE MODELOS
// ============================================================================================
// Establecer todas las relaciones después de cargar todos los modelos
// Las relaciones definen cómo se conectan las tablas en la base de datos

// ============================================================================================
// USER - CARD RELATIONS (Usuarios y sus cartas)
// ============================================================================================
// Un usuario puede tener muchas cartas (One-to-Many)
User.hasMany(Card, { foreignKey: 'userId' });
// Cada carta pertenece a un usuario específico
Card.belongsTo(User, { foreignKey: 'userId' });

// ============================================================================================
// MARKET - CARD RELATIONS (Mercado y cartas en venta)
// ============================================================================================
// Cada listado del mercado corresponde a una carta específica
Market.belongsTo(Card, { foreignKey: 'cardId' });
// Una carta puede tener un listado en el mercado (One-to-One opcional)
Card.hasOne(Market, { foreignKey: 'cardId' });

// ============================================================================================
// MARKET - USER RELATIONS (Mercado y vendedores)
// ============================================================================================
// Cada listado del mercado tiene un vendedor (usuario)
Market.belongsTo(User, { as: 'seller', foreignKey: 'sellerId' });
// Un usuario puede tener múltiples listados en el mercado
User.hasMany(Market, { as: 'listings', foreignKey: 'sellerId' });

// ============================================================================================
// CHAT RELATIONS (Sistema de conversaciones)
// ============================================================================================
// Cada chat involucra dos usuarios y está relacionado con un listado del mercado
Chat.belongsTo(User, { as: 'user1', foreignKey: 'userId1' });     // Primer participante
Chat.belongsTo(User, { as: 'user2', foreignKey: 'userId2' });     // Segundo participante
Chat.belongsTo(Market, { foreignKey: 'marketId' });               // Listado que originó el chat

// Relaciones inversas para acceder a chats desde usuarios y mercado
User.hasMany(Chat, { as: 'chatsAsUser1', foreignKey: 'userId1' });
User.hasMany(Chat, { as: 'chatsAsUser2', foreignKey: 'userId2' });
Market.hasMany(Chat, { foreignKey: 'marketId' });

// ============================================================================================
// MESSAGE RELATIONS (Mensajes en los chats)
// ============================================================================================
// Cada mensaje pertenece a un chat específico (se elimina si se elimina el chat)
Message.belongsTo(Chat, { foreignKey: 'chatId', onDelete: 'CASCADE' });
// Cada mensaje tiene un remitente (usuario)
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

// Relaciones inversas
Chat.hasMany(Message, { foreignKey: 'chatId', onDelete: 'CASCADE' });
User.hasMany(Message, { as: 'sentMessages', foreignKey: 'senderId' });

// ============================================================================================
// TRADE RELATIONS (Sistema de intercambios)
// ============================================================================================
// Cada transacción está asociada a un chat específico
Trade.belongsTo(Chat, { foreignKey: 'chatId', onDelete: 'CASCADE' });
// Cada transacción se refiere a un listado del mercado
Trade.belongsTo(Market, { foreignKey: 'marketId' });
// Cada transacción tiene comprador y vendedor
Trade.belongsTo(User, { as: 'buyer', foreignKey: 'buyerId' });
Trade.belongsTo(User, { as: 'seller', foreignKey: 'sellerId' });
// Registro de quién rechazó la transacción (si aplica)
Trade.belongsTo(User, { as: 'rejectedByUser', foreignKey: 'rejectedBy' });

// Relaciones inversas para acceder a transacciones desde otros modelos
Chat.hasMany(Trade, { foreignKey: 'chatId', onDelete: 'CASCADE' });
Market.hasMany(Trade, { foreignKey: 'marketId' });
User.hasMany(Trade, { as: 'buyerTrades', foreignKey: 'buyerId' });
User.hasMany(Trade, { as: 'sellerTrades', foreignKey: 'sellerId' });

// ============================================================================================
// EXPORTACIÓN DE MODELOS
// ============================================================================================
// Exportar todos los modelos para uso en controladores y rutas
module.exports = {
  User,     // Gestión de usuarios
  Card,     // Gestión de cartas
  Market,   // Gestión del mercado
  Chat,     // Gestión de conversaciones
  Message,  // Gestión de mensajes
  Trade     // Gestión de transacciones
}; 