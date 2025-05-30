const { Chat, Message, User, Market, Card } = require('../models');
const { sequelize, Op } = require('../config/database');

// Crear un nuevo chat
const createChat = async (req, res) => {
  try {
    const { marketId } = req.body;
    const userId = req.user.id;

    // Verificar que el listado existe
    const listing = await Market.findByPk(marketId, {
      include: [{ model: User, as: 'seller' }]
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listado no encontrado' });
    }

    // No permitir crear chat con uno mismo
    if (listing.sellerId === userId) {
      return res.status(400).json({ error: 'No puedes iniciar un chat contigo mismo' });
    }

    // Verificar si ya existe un chat para este usuario y este listado
    const existingChat = await Chat.findOne({
      where: {
        marketId,
        [Op.or]: [
          { userId1: userId, userId2: listing.sellerId },
          { userId1: listing.sellerId, userId2: userId }
        ]
      }
    });

    if (existingChat) {
      return res.status(200).json({
        message: 'Ya existe un chat para este listado',
        chat: existingChat
      });
    }

    // Crear nuevo chat
    const chat = await Chat.create({
      userId1: userId,
      userId2: listing.sellerId,
      marketId
    });

    return res.status(201).json({
      message: 'Chat creado correctamente',
      chat
    });
  } catch (error) {
    console.error('Error al crear chat:', error);
    return res.status(500).json({ error: 'Error al crear el chat' });
  }
};

// Obtener chats del usuario
const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar chats donde el usuario es participante
    const chats = await Chat.findAll({
      where: {
        [Op.or]: [
          { userId1: userId },
          { userId2: userId }
        ],
        isActive: true
      },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'username', 'profilePicture']
        },
        {
          model: User,
          as: 'user2',
          attributes: ['id', 'username', 'profilePicture']
        },
        {
          model: Market,
          required: false, // LEFT JOIN para evitar que se filtren chats sin market
          include: [{
            model: Card,
            required: false,
            attributes: ['id', 'name', 'imageUrl', 'edition', 'condition']
          }]
        }
      ],
      order: [['lastActivity', 'DESC']]
    });

    // Filtrar chats que realmente deberían existir (que tienen market válido)
    const validChats = chats.filter(chat => {
      // Si el chat no tiene market asociado, podría ser huérfano
      if (!chat.Market) {
        console.log(`Chat ${chat.id} has no associated market, might be orphaned`);
        return false;
      }
      return true;
    });

    return res.status(200).json(validChats);
  } catch (error) {
    console.error('Error al obtener chats del usuario:', error);
    return res.status(500).json({ error: 'Error al obtener los chats del usuario' });
  }
};

// Obtener mensajes de un chat
const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    
    // Verificar que el chat existe y el usuario es participante
    const chat = await Chat.findOne({
      where: {
        id: chatId,
        [Op.or]: [
          { userId1: userId },
          { userId2: userId }
        ]
      }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat no encontrado o no tienes acceso' });
    }

    // Obtener mensajes
    const messages = await Message.findAll({
      where: { chatId },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'username', 'profilePicture']
      }],
      order: [['sentAt', 'ASC']]
    });

    // Marcar mensajes como leídos (los que no son del usuario)
    await Message.update(
      { read: true },
      {
        where: {
          chatId,
          senderId: { [Op.ne]: userId },
          read: false
        }
      }
    );

    // Incluir información del chat con las relaciones
    const chatWithDetails = await Chat.findByPk(chatId, {
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'username', 'profilePicture']
        },
        {
          model: User,
          as: 'user2',
          attributes: ['id', 'username', 'profilePicture']
        },
        {
          model: Market,
          required: false,
          include: [{
            model: Card,
            required: false,
            attributes: ['id', 'name', 'imageUrl', 'edition', 'condition']
          }]
        }
      ]
    });

    return res.status(200).json({ 
      messages,
      chat: chatWithDetails,
      roomId: chat.roomId 
    });
  } catch (error) {
    console.error('Error al obtener mensajes del chat:', error);
    return res.status(500).json({ error: 'Error al obtener los mensajes del chat' });
  }
};

// Enviar un mensaje
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    // Verificar que el chat existe y el usuario es participante
    const chat = await Chat.findOne({
      where: {
        id: chatId,
        [Op.or]: [
          { userId1: userId },
          { userId2: userId }
        ]
      }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat no encontrado o no tienes acceso' });
    }

    // Crear mensaje
    const message = await Message.create({
      chatId,
      senderId: userId,
      content
    });

    // Actualizar última actividad del chat
    await chat.update({ lastActivity: new Date() });

    // Incluir información del remitente en la respuesta
    const messageWithSender = await Message.findByPk(message.id, {
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'username', 'profilePicture']
      }]
    });

    return res.status(201).json({ message: messageWithSender });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    return res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
};

// Marcar mensajes como leídos
const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    
    // Verificar que el chat existe y el usuario es participante
    const chat = await Chat.findOne({
      where: {
        id: chatId,
        [Op.or]: [
          { userId1: userId },
          { userId2: userId }
        ]
      }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat no encontrado o no tienes acceso' });
    }

    // Marcar mensajes como leídos (los que no son del usuario)
    const result = await Message.update(
      { read: true },
      {
        where: {
          chatId,
          senderId: { [Op.ne]: userId },
          read: false
        }
      }
    );

    return res.status(200).json({ 
      message: 'Mensajes marcados como leídos',
      count: result[0]
    });
  } catch (error) {
    console.error('Error al marcar mensajes como leídos:', error);
    return res.status(500).json({ error: 'Error al marcar los mensajes como leídos' });
  }
};

// Obtener conteo de mensajes no leídos
const getUnreadCounts = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Getting unread counts for user:', userId);
    
    // Obtener todos los chats del usuario
    const chats = await Chat.findAll({
      where: {
        [Op.or]: [
          { userId1: userId },
          { userId2: userId }
        ],
        isActive: true
      }
    });

    const chatIds = chats.map(chat => chat.id);
    
    // Contar mensajes no leídos por chat
    const unreadMessagesCounts = await Message.findAll({
      where: {
        chatId: { [Op.in]: chatIds },
        senderId: { [Op.ne]: userId },
        read: false
      },
      attributes: ['chatId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['chatId']
    });

    // Calcular total y chats con mensajes no leídos
    let totalUnread = 0;
    const unreadChatIds = [];
    
    unreadMessagesCounts.forEach(item => {
      const count = parseInt(item.dataValues.count);
      totalUnread += count;
      if (count > 0) {
        unreadChatIds.push(item.chatId);
      }
    });

    console.log('Returning unread counts:', { totalUnread, unreadChatIds });
    return res.status(200).json({
      totalUnread,
      unreadChatIds
    });
  } catch (error) {
    console.error('Error al obtener conteo de mensajes no leídos:', error);
    return res.status(500).json({ error: 'Error al obtener el conteo de mensajes no leídos' });
  }
};

// Limpiar chats huérfanos (sin market asociado)
const cleanupOrphanedChats = async (req, res) => {
  try {
    // Buscar chats que no tienen market asociado
    const orphanedChats = await Chat.findAll({
      include: [{
        model: Market,
        required: false
      }],
      where: {
        '$Market.id$': null // Chats sin market asociado
      }
    });

    if (orphanedChats.length === 0) {
      return res.status(200).json({ 
        message: 'No orphaned chats found',
        deletedCount: 0 
      });
    }

    const chatIds = orphanedChats.map(chat => chat.id);
    console.log(`Found ${orphanedChats.length} orphaned chats: ${chatIds.join(', ')}`);

    // Eliminar chats huérfanos
    const deletedCount = await Chat.destroy({
      where: {
        id: chatIds
      },
      force: true
    });

    console.log(`Cleanup completed. Deleted ${deletedCount} orphaned chats.`);

    return res.status(200).json({ 
      message: `Cleaned up ${deletedCount} orphaned chats`,
      deletedChats: chatIds,
      deletedCount 
    });

  } catch (error) {
    console.error('Error cleaning up orphaned chats:', error);
    return res.status(500).json({ error: 'Error cleaning up orphaned chats' });
  }
};

module.exports = {
  createChat,
  getUserChats,
  getChatMessages,
  sendMessage,
  markAsRead,
  getUnreadCounts,
  cleanupOrphanedChats
}; 