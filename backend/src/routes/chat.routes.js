const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validator.middleware');
const { chatValidators } = require('../utils/validators');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Ruta para crear un nuevo chat
router.post('/', chatValidators.create, validate, chatController.createChat);

// Ruta para obtener todos los chats del usuario
router.get('/', chatController.getUserChats);

// Ruta para obtener mensajes de un chat
router.get('/:chatId/messages', chatValidators.getMessages, validate, chatController.getChatMessages);

// Ruta para enviar un mensaje
router.post('/:chatId/messages', chatValidators.sendMessage, validate, chatController.sendMessage);

// Ruta para marcar mensajes como leídos
router.put('/:chatId/read', chatValidators.markAsRead, validate, chatController.markAsRead);

// Ruta para obtener conteo de mensajes no leídos
router.get('/unread/counts', chatController.getUnreadCounts);

// Ruta para limpiar chats huérfanos (admin/debugging)
router.delete('/cleanup/orphaned', chatController.cleanupOrphanedChats);

module.exports = router; 