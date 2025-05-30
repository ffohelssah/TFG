// ================================================================================================
// RUTAS DE USUARIOS - USER ROUTES
// ================================================================================================
// Este archivo define las rutas para la gestión de usuarios y perfiles.
// Incluye tanto rutas públicas (perfiles públicos) como protegidas (gestión personal).
// 
// RUTAS DISPONIBLES:
// - GET    /api/users/:id          - Obtener perfil público de usuario
// - PUT    /api/users/profile      - Actualizar perfil propio (requiere auth)
// - PUT    /api/users/password     - Cambiar contraseña propia (requiere auth)
// ================================================================================================

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validator.middleware');
const { userValidators } = require('../utils/validators');
const { upload, handleUploadError } = require('../middlewares/upload.middleware');

// ============================================================================================
// RUTAS PÚBLICAS (NO REQUIEREN AUTENTICACIÓN)
// ============================================================================================

// ========================================================================================
// OBTENER PERFIL PÚBLICO
// ========================================================================================
// GET /api/users/:id
// Función: Recuperar información pública de cualquier usuario
// Filtrado: Solo datos no sensibles (sin email, sin password)
// Uso: Para mostrar información de vendedores/compradores
// Ruta pública para obtener perfil público de un usuario
router.get('/:id', userValidators.getPublicProfile, validate, userController.getPublicProfile);

// ============================================================================================
// RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN)
// ============================================================================================
// Las siguientes rutas requieren autenticación
router.use(authenticate);

// ========================================================================================
// ACTUALIZAR PERFIL PROPIO
// ========================================================================================
// PUT /api/users/profile
// Función: Modificar información del perfil incluyendo imagen
// Middlewares: Upload opcional de imagen de perfil, validaciones
// Gestión de archivos: Reemplazo automático de imagen anterior
// Rutas para gestionar el perfil propio
router.put('/profile', 
  upload.single('profilePicture'), 
  handleUploadError,
  userValidators.updateProfile, 
  validate, 
  userController.updateProfile
);

// ========================================================================================
// CAMBIAR CONTRASEÑA PROPIA
// ========================================================================================
// PUT /api/users/password
// Función: Actualizar contraseña del usuario autenticado
// Seguridad: Verificación obligatoria de contraseña actual
// Validaciones: Contraseña actual y nueva válidas
router.put('/password', userValidators.changePassword, validate, userController.changePassword);

module.exports = router; 