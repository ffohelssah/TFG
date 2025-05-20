const express = require('express');
const router = express.Router();
const cardController = require('../controllers/card.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validator.middleware');
const { cardValidators } = require('../utils/validators');
const { upload, handleUploadError } = require('../middlewares/upload.middleware');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Ruta para crear una nueva carta
router.post('/', 
  upload.single('image'), 
  handleUploadError,
  cardValidators.create, 
  validate, 
  cardController.createCard
);

// Ruta para obtener todas las cartas del usuario
router.get('/', cardController.getUserCards);

// Ruta para obtener una carta por ID
router.get('/:id', cardValidators.getById, validate, cardController.getCardById);

// Ruta para actualizar una carta
router.put('/:id', 
  upload.single('image'), 
  handleUploadError,
  cardValidators.update, 
  validate, 
  cardController.updateCard
);

// Ruta para eliminar una carta
router.delete('/:id', cardValidators.delete, validate, cardController.deleteCard);

module.exports = router; 