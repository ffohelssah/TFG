const { body, param, query } = require('express-validator');

// Validadores para autenticación
const authValidators = {
  register: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
    
    body('email')
      .trim()
      .isEmail()
      .withMessage('Debe proporcionar un email válido')
      .normalizeEmail(),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres')
  ],

  login: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Debe proporcionar un email válido')
      .normalizeEmail(),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres')
  ]
};

// Validadores para cartas
const cardValidators = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('El nombre de la carta es obligatorio'),
    
    body('edition')
      .trim()
      .notEmpty()
      .withMessage('La edición de la carta es obligatoria'),
    
    body('condition')
      .isIn(['mint', 'near mint', 'excellent', 'good', 'light played', 'played', 'poor'])
      .withMessage('El estado debe ser uno de los valores permitidos')
  ],

  update: [
    param('id')
      .isInt()
      .withMessage('ID de carta inválido'),
    
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('El nombre de la carta no puede estar vacío'),
    
    body('edition')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('La edición de la carta no puede estar vacía'),
    
    body('condition')
      .optional()
      .isIn(['mint', 'near mint', 'excellent', 'good', 'light played', 'played', 'poor'])
      .withMessage('El estado debe ser uno de los valores permitidos'),
    
    body('isListed')
      .optional()
      .isBoolean()
      .withMessage('isListed debe ser un valor booleano'),
    
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('El precio debe ser mayor o igual a 0')
  ],

  getById: [
    param('id')
      .isInt()
      .withMessage('ID de carta inválido')
  ],

  delete: [
    param('id')
      .isInt()
      .withMessage('ID de carta inválido')
  ]
};

// Validadores para el mercado
const marketValidators = {
  listCard: [
    body('cardId')
      .isInt()
      .withMessage('ID de carta inválido'),
    
    body('price')
      .isFloat({ min: 0 })
      .withMessage('El precio debe ser mayor o igual a 0'),
    
    body('description')
      .optional()
      .trim()
  ],

  getListings: [
    query('status')
      .optional()
      .isIn(['available', 'pending', 'sold'])
      .withMessage('Estado inválido'),
    
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Número de página inválido'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Límite inválido (debe estar entre 1 y 50)')
  ],

  getById: [
    param('id')
      .isInt()
      .withMessage('ID de listado inválido')
  ],

  update: [
    param('id')
      .isInt()
      .withMessage('ID de listado inválido'),
    
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('El precio debe ser mayor o igual a 0'),
    
    body('description')
      .optional()
      .trim(),
    
    body('status')
      .optional()
      .isIn(['available', 'pending', 'sold'])
      .withMessage('Estado inválido')
  ],

  delete: [
    param('id')
      .isInt()
      .withMessage('ID de listado inválido')
  ]
};

// Validadores para chat
const chatValidators = {
  create: [
    body('marketId')
      .isInt()
      .withMessage('ID de listado inválido')
  ],

  getMessages: [
    param('chatId')
      .isInt()
      .withMessage('ID de chat inválido')
  ],

  sendMessage: [
    param('chatId')
      .isInt()
      .withMessage('ID de chat inválido'),
    
    body('content')
      .trim()
      .notEmpty()
      .withMessage('El contenido del mensaje no puede estar vacío')
  ],

  markAsRead: [
    param('chatId')
      .isInt()
      .withMessage('ID de chat inválido')
  ]
};

// Validadores para usuario
const userValidators = {
  updateProfile: [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
    
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Debe proporcionar un email válido')
      .normalizeEmail()
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('La contraseña actual es obligatoria'),
    
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
  ],

  getPublicProfile: [
    param('id')
      .isInt()
      .withMessage('ID de usuario inválido')
  ]
};

module.exports = {
  authValidators,
  cardValidators,
  marketValidators,
  chatValidators,
  userValidators
}; 