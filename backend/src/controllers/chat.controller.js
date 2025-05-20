const { Chat, Message, User, Market, Card } = require('../models');
const { sequelize } = require('../config/database');

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
        [sequelize.Op.or]: [
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
        [sequelize.Op.or]: [
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
          include: [{
            model: Card,
            attributes: ['name', 'imageUrl']
          }]
        }
      ],
      order: [['lastActivity', 'DESC']]
    });

    // Formatear respuesta para facilitar uso en el cliente
    const formattedChats = chats.map(chat => {
      const otherUser = chat.userId1 === userId ? chat.user2 : chat.user1;
      
      return {
        id: chat.id,
        roomId: chat.roomId,
        marketId: chat.marketId,
        otherUser: {
          id: otherUser.id,
          username: otherUser.username,
          profilePicture: otherUser.profilePicture
        },
        card: chat.Market?.Card,
        lastActivity: chat.lastActivity,
        createdAt: chat.createdAt
      };
    });

    return res.status(200).json({ chats: formattedChats });
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
        [sequelize.Op.or]: [
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
          senderId: { [sequelize.Op.ne]: userId },
          read: false
        }
      }
    );

    return res.status(200).json({ 
      messages,
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
        [sequelize.Op.or]: [
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
        [sequelize.Op.or]: [
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
          senderId: { [sequelize.Op.ne]: userId },
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

module.exports = {
  createChat,
  getUserChats,
  getChatMessages,
  sendMessage,
  markAsRead
}; 