const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validator.middleware');
const { marketValidators } = require('../utils/validators');

// Rutas públicas (no requieren autenticación)
router.get('/', marketValidators.getListings, validate, marketController.getListings);
router.get('/:id', marketValidators.getById, validate, marketController.getListingById);

// Las siguientes rutas requieren autenticación
router.use(authenticate);

// Rutas para gestionar listados propios
router.post('/', marketValidators.listCard, validate, marketController.listCard);
router.get('/user/listings', marketController.getUserListings);
router.put('/:id', marketValidators.update, validate, marketController.updateListing);
router.delete('/:id', marketValidators.delete, validate, marketController.deleteListing);

// Ruta para eliminar listado por cardId
router.delete('/card/:cardId', marketController.unlistCardByCardId);

module.exports = router; 