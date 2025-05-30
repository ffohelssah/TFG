// ================================================================================================
// RUTAS DE INTERCAMBIOS - TRADE ROUTES
// ================================================================================================
// Este archivo define todas las rutas para el sistema de trading de cartas.
// Todas las rutas requieren autenticación ya que los trades son transacciones entre usuarios.
// 
// RUTAS DISPONIBLES:
// - GET    /api/trades/chat/:chatId           - Obtener trade activo de un chat
// - POST   /api/trades/chat/:chatId/initiate  - Iniciar nuevo trade en chat
// - PUT    /api/trades/:tradeId/accept        - Aceptar propuesta de trade
// - PUT    /api/trades/:tradeId/reject        - Rechazar propuesta de trade
// ================================================================================================

const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/trade.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// ============================================================================================
// OBTENER TRADE ACTIVO DE CHAT
// ============================================================================================
// GET /api/trades/chat/:chatId
// Función: Recuperar información del trade activo en una conversación
// Validaciones: Usuario participante del chat
// Estados válidos: pending, buyer_accepted, seller_accepted, both_accepted
// Obtener trade activo de un chat
router.get('/chat/:chatId', authenticate, tradeController.getChatTrade);

// ============================================================================================
// INICIAR TRADE
// ============================================================================================
// POST /api/trades/chat/:chatId/initiate
// Función: Crear nueva propuesta de intercambio en una conversación
// Restricciones: Solo compradores pueden iniciar, no vendedores
// Validaciones: Sin trades activos duplicados, chat válido
// Iniciar un trade
router.post('/chat/:chatId/initiate', authenticate, tradeController.initiateTrade);

// ============================================================================================
// ACEPTAR TRADE
// ============================================================================================
// PUT /api/trades/:tradeId/accept
// Función: Confirmar participación en el intercambio
// Lógica: Sistema de doble confirmación (buyer + seller)
// Auto-completion: Si ambos aceptan, ejecuta transferencia automática
// Aceptar un trade
router.put('/:tradeId/accept', authenticate, tradeController.acceptTrade);

// ============================================================================================
// RECHAZAR TRADE
// ============================================================================================
// PUT /api/trades/:tradeId/reject
// Función: Cancelar propuesta de intercambio
// Efectos: Actualiza estado a rechazado y elimina chat completo
// Limpieza: Destrucción en cascada de mensajes y relaciones
// Rechazar un trade
router.put('/:tradeId/reject', authenticate, tradeController.rejectTrade);

module.exports = router; 