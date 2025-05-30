// ================================================================================================
// RUTAS DE CARTAS - CARD ROUTES
// ================================================================================================
// Este archivo define todas las rutas para la gestión de cartas de los usuarios.
// Todas las rutas requieren autenticación ya que las cartas pertenecen a usuarios específicos.
// 
// RUTAS DISPONIBLES:
// - POST   /api/cards/     - Crear nueva carta con imagen
// - GET    /api/cards/     - Obtener todas las cartas del usuario
// - GET    /api/cards/:id  - Obtener carta específica por ID
// - PUT    /api/cards/:id  - Actualizar carta existente
// - DELETE /api/cards/:id  - Eliminar carta y sus relaciones
// ================================================================================================

const express = require('express');
const router = express.Router();
const cardController = require('../controllers/card.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validator.middleware');
const { cardValidators } = require('../utils/validators');
const { upload, handleUploadError } = require('../middlewares/upload.middleware');

// ============================================================================================
// MIDDLEWARE GLOBAL DE AUTENTICACIÓN
// ============================================================================================
// Todas las rutas de cartas requieren usuario autenticado
// Las cartas son privadas y pertenecen a usuarios específicos
// Todas las rutas requieren autenticación
router.use(authenticate);

// ============================================================================================
// CREAR NUEVA CARTA
// ============================================================================================
// POST /api/cards/
// Función: Crear nueva carta en la colección del usuario
// Middlewares: Upload de imagen (obligatorio), validaciones de datos
// Gestión de archivos: Subida y almacenamiento de imagen
// Ruta para crear una nueva carta
router.post('/', 
  upload.single('image'), 
  handleUploadError,
  cardValidators.create, 
  validate, 
  cardController.createCard
);

// ============================================================================================
// OBTENER CARTAS DEL USUARIO
// ============================================================================================
// GET /api/cards/
// Función: Recuperar todas las cartas que pertenecen al usuario autenticado
// Ordenamiento: Por fecha de creación (más recientes primero)
// Scope: Solo cartas propias del usuario
// Ruta para obtener todas las cartas del usuario
router.get('/', cardController.getUserCards);

// ============================================================================================
// OBTENER CARTA POR ID
// ============================================================================================
// GET /api/cards/:id
// Función: Recuperar una carta específica del usuario
// Validaciones: ID válido, carta pertenece al usuario
// Seguridad: Solo propietario puede ver sus cartas
// Ruta para obtener una carta por ID
router.get('/:id', cardValidators.getById, validate, cardController.getCardById);

// ============================================================================================
// ACTUALIZAR CARTA
// ============================================================================================
// PUT /api/cards/:id
// Función: Modificar información de una carta existente
// Middlewares: Upload opcional de nueva imagen, validaciones
// Gestión de archivos: Reemplazo automático de imagen anterior
// Ruta para actualizar una carta
router.put('/:id', 
  upload.single('image'), 
  handleUploadError,
  cardValidators.update, 
  validate, 
  cardController.updateCard
);

// ============================================================================================
// ELIMINAR CARTA
// ============================================================================================
// DELETE /api/cards/:id
// Función: Eliminar carta y todas sus relaciones del sistema
// Transacciones: Limpieza en cascada de listados, chats, mensajes, trades
// Gestión de archivos: Eliminación de imagen del sistema
// Ruta para eliminar una carta
router.delete('/:id', cardValidators.delete, validate, cardController.deleteCard);

module.exports = router; 