const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validator.middleware');
const { marketValidators } = require('../utils/validators');

// ================================================================================================
// RUTAS DE MERCADO - MARKET ROUTES
// ================================================================================================
// Este archivo define todas las rutas para el marketplace de cartas.
// Maneja tanto rutas públicas (consultar listados) como protegidas (gestionar listados).
// 
// RUTAS DISPONIBLES:
// - GET    /api/market/           - Obtener listados públicos con filtros
// - GET    /api/market/:id        - Obtener detalle de listado específico
// - POST   /api/market/           - Crear nuevo listado (requiere auth)
// - GET    /api/market/user/listings - Obtener listados del usuario (requiere auth)
// - PUT    /api/market/:id        - Actualizar listado (requiere auth)
// - DELETE /api/market/:id        - Eliminar listado (requiere auth)
// - DELETE /api/market/card/:cardId - Remover carta del mercado (requiere auth)
// ================================================================================================

// ============================================================================================
// IMPORTACIONES
// ============================================================================================

// ============================================================================================
// RUTAS PÚBLICAS (NO REQUIEREN AUTENTICACIÓN)
// ============================================================================================

// ========================================================================================
// OBTENER LISTADOS PÚBLICOS
// ========================================================================================
// GET /api/market/
// Función: Recuperar listados del mercado con paginación y filtros
// Parámetros: status, sortBy, order, page, limit
// Validaciones: Parámetros de consulta válidos
router.get('/', marketValidators.getListings, validate, marketController.getListings);

// ========================================================================================
// OBTENER DETALLE DE LISTADO
// ========================================================================================
// GET /api/market/:id
// Función: Recuperar información completa de un listado específico
// Validaciones: ID de listado válido
// Includes: Carta, vendedor, descripción completa
router.get('/:id', marketValidators.getById, validate, marketController.getListingById);

// ============================================================================================
// RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN)
// ============================================================================================
// Las siguientes rutas requieren autenticación
router.use(authenticate);

// ========================================================================================
// CREAR NUEVO LISTADO
// ========================================================================================
// POST /api/market/
// Función: Listar una carta del usuario en el mercado
// Validaciones: Datos de listado válidos, carta del usuario
// Restricciones: Una carta solo puede tener un listado activo
router.post('/', marketValidators.listCard, validate, marketController.listCard);

// ========================================================================================
// OBTENER LISTADOS DEL USUARIO
// ========================================================================================
// GET /api/market/user/listings
// Función: Recuperar todos los listados creados por el usuario autenticado
// Scope: Solo listados propios, todos los estados
router.get('/user/listings', marketController.getUserListings);

// ========================================================================================
// ACTUALIZAR LISTADO
// ========================================================================================
// PUT /api/market/:id
// Función: Modificar precio, descripción o estado de listado
// Validaciones: Listado válido, pertenece al usuario
// Sincronización: Estado de carta actualizado automáticamente
router.put('/:id', marketValidators.update, validate, marketController.updateListing);

// ========================================================================================
// ELIMINAR LISTADO
// ========================================================================================
// DELETE /api/market/:id
// Función: Eliminar listado del mercado
// Efectos: Actualiza estado de carta, mantiene consistencia
router.delete('/:id', marketValidators.delete, validate, marketController.deleteListing);

// ========================================================================================
// REMOVER CARTA DEL MERCADO
// ========================================================================================
// DELETE /api/market/card/:cardId
// Función: Remover carta del mercado usando ID de carta
// Ventaja: Más conveniente para frontend, maneja estados inconsistentes
router.delete('/card/:cardId', marketController.unlistCardByCardId);

module.exports = router; 