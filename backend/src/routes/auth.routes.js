// ================================================================================================
// RUTAS DE AUTENTICACIÓN - AUTH ROUTES
// ================================================================================================
// Este archivo define todas las rutas relacionadas con autenticación y gestión de usuarios.
// Cada ruta conecta con el controlador correspondiente y aplica los middlewares necesarios.
// 
// RUTAS DISPONIBLES:
// - POST   /api/auth/register    - Registro de nuevos usuarios
// - POST   /api/auth/login       - Autenticación de usuarios
// - GET    /api/auth/profile     - Obtener perfil del usuario autenticado
// - PUT    /api/auth/profile     - Actualizar perfil del usuario
// - PUT    /api/auth/password    - Cambiar contraseña del usuario
// - DELETE /api/auth/account     - Eliminar cuenta del usuario
// ================================================================================================

// ============================================================================================
// IMPORTACIONES
// ============================================================================================
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');        // Controlador de autenticación
const { authenticate } = require('../middlewares/auth.middleware');      // Middleware de autenticación JWT
const { validate } = require('../middlewares/validator.middleware');     // Middleware de validación
const { authValidators } = require('../utils/validators');               // Validadores específicos

// ============================================================================================
// RUTAS PÚBLICAS (NO REQUIEREN AUTENTICACIÓN)
// ============================================================================================

// ========================================================================================
// REGISTRO DE USUARIOS
// ========================================================================================
// POST /api/auth/register
// Función: Crear una nueva cuenta de usuario
// Middlewares: Validación de datos de entrada
// Validaciones: Username único, email válido, contraseña fuerte
router.post('/register', authValidators.register, validate, authController.register);

// ========================================================================================
// LOGIN DE USUARIOS
// ========================================================================================
// POST /api/auth/login
// Función: Autenticar usuario y generar token JWT
// Middlewares: Validación de credenciales
// Respuesta: Token JWT y datos del usuario
router.post('/login', authValidators.login, validate, authController.login);

// ============================================================================================
// RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN)
// ============================================================================================

// ========================================================================================
// OBTENER PERFIL DE USUARIO
// ========================================================================================
// GET /api/auth/profile
// Función: Recuperar información del usuario autenticado
// Middlewares: authenticate (verificar token JWT válido)
// Acceso: Solo usuario autenticado puede ver su propio perfil
router.get('/profile', authenticate, authController.getProfile);

// ========================================================================================
// ACTUALIZAR PERFIL DE USUARIO
// ========================================================================================
// PUT /api/auth/profile
// Función: Modificar información básica del usuario (username, email)
// Middlewares: authenticate (verificar token JWT válido)
// Validaciones: Username y email únicos en el sistema
router.put('/profile', authenticate, authController.updateProfile);

// ========================================================================================
// CAMBIAR CONTRASEÑA
// ========================================================================================
// PUT /api/auth/password
// Función: Actualizar la contraseña del usuario
// Middlewares: authenticate (verificar token JWT válido)
// Seguridad: Requiere contraseña actual para confirmar cambio
router.put('/password', authenticate, authController.changePassword);

// ========================================================================================
// ELIMINAR CUENTA
// ========================================================================================
// DELETE /api/auth/account
// Función: Eliminar permanentemente la cuenta del usuario
// Middlewares: authenticate (verificar token JWT válido)
// Efecto: Eliminación en cascada de todos los datos relacionados
router.delete('/account', authenticate, authController.deleteAccount);

// ============================================================================================
// EXPORTACIÓN DEL ROUTER
// ============================================================================================
module.exports = router; 