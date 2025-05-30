// ================================================================================================
// RUTAS DE CHAT - CHAT ROUTES
// ================================================================================================
// Este archivo define todas las rutas para el sistema de mensajería en tiempo real.
// Todas las rutas requieren autenticación ya que los chats son privados entre usuarios.
// 
// RUTAS DISPONIBLES:
// - POST   /api/chats/                    - Crear nuevo chat con vendedor
// - GET    /api/chats/                    - Obtener todos los chats del usuario
// - GET    /api/chats/:chatId/messages    - Obtener mensajes de un chat
// - POST   /api/chats/:chatId/messages    - Enviar mensaje en un chat
// - PUT    /api/chats/:chatId/read        - Marcar mensajes como leídos
// - GET    /api/chats/unread/counts       - Obtener conteo de mensajes no leídos
// - DELETE /api/chats/cleanup/orphaned    - Limpiar chats huérfanos (admin)
// ================================================================================================

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validator.middleware');
const { chatValidators } = require('../utils/validators');

// ============================================================================================
// MIDDLEWARE GLOBAL DE AUTENTICACIÓN
// ============================================================================================
// Todas las rutas de chat requieren usuario autenticado
// Los chats son privados entre compradores y vendedores
// Todas las rutas requieren autenticación
router.use(authenticate);

// ============================================================================================
// CREAR NUEVO CHAT
// ============================================================================================
// POST /api/chats/
// Función: Iniciar conversación entre comprador y vendedor
// Validaciones: MarketId válido, usuario no es el vendedor
// Lógica: Reutiliza chats existentes para misma pareja usuario-listado
// Ruta para crear un nuevo chat
router.post('/', chatValidators.create, validate, chatController.createChat);

// ============================================================================================
// OBTENER CHATS DEL USUARIO
// ============================================================================================
// GET /api/chats/
// Función: Recuperar todas las conversaciones activas del usuario
// Filtrado: Solo chats válidos con mercado asociado
// Ordenamiento: Por última actividad (más recientes primero)
// Ruta para obtener todos los chats del usuario
router.get('/', chatController.getUserChats);

// ============================================================================================
// OBTENER MENSAJES DE CHAT
// ============================================================================================
// GET /api/chats/:chatId/messages
// Función: Recuperar historial completo de mensajes
// Validaciones: Usuario participante del chat
// Efectos: Marca automáticamente mensajes como leídos
// Ruta para obtener mensajes de un chat
router.get('/:chatId/messages', chatValidators.getMessages, validate, chatController.getChatMessages);

// ============================================================================================
// ENVIAR MENSAJE
// ============================================================================================
// POST /api/chats/:chatId/messages
// Función: Crear y enviar nuevo mensaje
// Validaciones: Contenido válido, usuario participante
// Efectos: Actualiza timestamp de última actividad del chat
// Ruta para enviar un mensaje
router.post('/:chatId/messages', chatValidators.sendMessage, validate, chatController.sendMessage);

// ============================================================================================
// MARCAR MENSAJES COMO LEÍDOS
// ============================================================================================
// PUT /api/chats/:chatId/read
// Función: Marcar todos los mensajes no leídos como leídos
// Scope: Solo mensajes enviados por otros usuarios
// Uso: Para actualizar estado de notificaciones
// Ruta para marcar mensajes como leídos
router.put('/:chatId/read', chatValidators.markAsRead, validate, chatController.markAsRead);

// ============================================================================================
// OBTENER CONTEO DE MENSAJES NO LEÍDOS
// ============================================================================================
// GET /api/chats/unread/counts
// Función: Calcular total de mensajes no leídos para notificaciones
// Respuesta: Total global y lista de chats con mensajes pendientes
// Uso: Para badges de notificación en UI
// Ruta para obtener conteo de mensajes no leídos
router.get('/unread/counts', chatController.getUnreadCounts);

// ============================================================================================
// LIMPIAR CHATS HUÉRFANOS
// ============================================================================================
// DELETE /api/chats/cleanup/orphaned
// Función: Eliminar chats que perdieron su listado asociado
// Uso: Mantenimiento de base de datos, herramienta de admin
// Detección: Chats sin mercado válido asociado
// Ruta para limpiar chats huérfanos (admin/debugging)
router.delete('/cleanup/orphaned', chatController.cleanupOrphanedChats);

module.exports = router; 