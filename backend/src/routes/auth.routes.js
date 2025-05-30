const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validator.middleware');
const { authValidators } = require('../utils/validators');

// Ruta para registro de usuarios
router.post('/register', authValidators.register, validate, authController.register);

// Ruta para login
router.post('/login', authValidators.login, validate, authController.login);

// Ruta para obtener perfil de usuario autenticado
router.get('/profile', authenticate, authController.getProfile);

// Ruta para actualizar perfil de usuario
router.put('/profile', authenticate, authController.updateProfile);

// Ruta para cambiar contraseña
router.put('/password', authenticate, authController.changePassword);

// Ruta para eliminar cuenta
router.delete('/account', authenticate, authController.deleteAccount);

module.exports = router; 