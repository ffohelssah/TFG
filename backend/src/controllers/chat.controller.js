const { Chat, Message, User, Market, Card } = require('../models');
const { sequelize, Op } = require('../config/database');

// ================================================================================================
// CONTROLADOR DE CHAT - CHAT CONTROLLER
// ================================================================================================
// Este controlador maneja todas las operaciones del sistema de mensajería en tiempo real:
// 1. Creación de conversaciones entre compradores y vendedores
// 2. Gestión de mensajes y notificaciones
// 3. Control de estados de lectura
// 4. Limpieza y mantenimiento de chats
// 
// CARACTERÍSTICAS PRINCIPALES:
// - Chats vinculados a listados específicos del mercado
// - Prevención de auto-conversaciones (vendedor consigo mismo)
// - Gestión automática de estados de lectura
// - Detección y limpieza de chats huérfanos
// - Actualización de actividad en tiempo real
// ================================================================================================

// ============================================================================================
// IMPORTACIONES
// ============================================================================================

// ============================================================================================
// CREAR NUEVO CHAT
// ============================================================================================
// Endpoint: POST /api/chats
// Función: Iniciar conversación entre comprador potencial y vendedor
// Validaciones: Listado válido, no autoconversación, chat único por listado
// Lógica: Reutilización de chats existentes para mismo par usuario-listado
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

// ============================================================================================
// OBTENER CHATS DEL USUARIO
// ============================================================================================
// Endpoint: GET /api/chats
// Función: Recuperar todas las conversaciones activas del usuario
// Includes: Datos de participantes, información del listado y carta
// Filtrado: Solo chats válidos con mercado asociado, ordenados por actividad
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

// ============================================================================================
// OBTENER MENSAJES DE UN CHAT
// ============================================================================================
// Endpoint: GET /api/chats/:chatId/messages
// Función: Recuperar historial completo de mensajes de una conversación
// Efectos secundarios: Marca automáticamente mensajes como leídos
// Includes: Información del remitente y detalles del chat
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

// ============================================================================================
// ENVIAR MENSAJE
// ============================================================================================
// Endpoint: POST /api/chats/:chatId/messages
// Función: Crear y enviar nuevo mensaje en una conversación
// Efectos secundarios: Actualiza timestamp de última actividad del chat
// Validación: Verificar participación del usuario en el chat
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

// ============================================================================================
// MARCAR MENSAJES COMO LEÍDOS
// ============================================================================================
// Endpoint: PUT /api/chats/:chatId/read
// Función: Marcar todos los mensajes no leídos del chat como leídos
// Scope: Solo mensajes enviados por otros usuarios (no propios)
// Respuesta: Contador de mensajes actualizados
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

// ============================================================================================
// OBTENER CONTEO DE MENSAJES NO LEÍDOS
// ============================================================================================
// Endpoint: GET /api/chats/unread-counts
// Función: Calcular total de mensajes no leídos para notificaciones
// Agregación: Total global y lista de chats con mensajes pendientes
// Performance: Consulta optimizada con agrupación por chat
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

// ============================================================================================
// LIMPIAR CHATS HUÉRFANOS
// ============================================================================================
// Endpoint: DELETE /api/chats/cleanup-orphaned
// Función: Eliminar chats que perdieron su listado asociado
// Uso: Mantenimiento de base de datos, evitar inconsistencias
// Detección: Chats sin mercado válido asociado
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