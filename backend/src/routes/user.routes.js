const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validator.middleware');
const { userValidators } = require('../utils/validators');
const { upload, handleUploadError } = require('../middlewares/upload.middleware');

// Ruta pública para obtener perfil público de un usuario
router.get('/:id', userValidators.getPublicProfile, validate, userController.getPublicProfile);

// Las siguientes rutas requieren autenticación
router.use(authenticate);

// Rutas para gestionar el perfil propio
router.put('/profile', 
  upload.single('profilePicture'), 
  handleUploadError,
  userValidators.updateProfile, 
  validate, 
  userController.updateProfile
);

router.put('/password', userValidators.changePassword, validate, userController.changePassword);

module.exports = router; 