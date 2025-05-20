const { verifyToken } = require('../config/jwt');
const { User } = require('../models');

// Middleware para verificar JWT
const authenticate = async (req, res, next) => {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }

    // Verificar token
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    // Buscar usuario
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si usuario está activo
    if (!user.isActive) {
      return res.status(403).json({ error: 'Cuenta de usuario desactivada' });
    }

    // Añadir usuario a request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(500).json({ error: 'Error en la autenticación' });
  }
};

// Middleware para verificar roles
const authorize = (roles = []) => {
  return (req, res, next) => {
    // Si no se especifican roles, cualquier usuario autenticado tiene acceso
    if (roles.length === 0) {
      return next();
    }
    
    // Verificar que el usuario tiene uno de los roles requeridos
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tiene permisos para acceder a este recurso' });
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  authorize
}; 