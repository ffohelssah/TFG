// ================================================================================================
// MIDDLEWARE DE AUTENTICACIÓN - AUTH MIDDLEWARE
// ================================================================================================
// Este middleware proporciona funciones de autenticación y autorización para proteger rutas.
// 
// FUNCIONES PRINCIPALES:
// 1. authenticate - Verificar tokens JWT y cargar usuario en request
// 2. authorize - Verificar permisos basados en roles de usuario
// 
// FLUJO DE AUTENTICACIÓN:
// 1. Extraer token JWT del header Authorization
// 2. Verificar validez y expiración del token
// 3. Obtener usuario de la base de datos
// 4. Verificar que el usuario esté activo
// 5. Agregar usuario a req.user para uso en controladores
// ================================================================================================

// ============================================================================================
// IMPORTACIONES
// ============================================================================================
const { verifyToken } = require('../config/jwt'); // Utilidad para verificar JWT
const { User } = require('../models');            // Modelo de usuario

// ============================================================================================
// MIDDLEWARE DE AUTENTICACIÓN JWT
// ============================================================================================
// Función: Verificar token JWT y cargar usuario en el request
// Uso: Proteger rutas que requieren usuario autenticado
// Headers: Requiere "Authorization: Bearer <token>"
const authenticate = async (req, res, next) => {
  try {
    // ========================================================================================
    // EXTRACCIÓN DEL TOKEN
    // ========================================================================================
    // Obtener token del header Authorization (formato: "Bearer <token>")
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }

    // ========================================================================================
    // VERIFICACIÓN DEL TOKEN JWT
    // ========================================================================================
    // Extraer y verificar el token JWT
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    // ========================================================================================
    // VALIDACIÓN DEL USUARIO
    // ========================================================================================
    // Buscar usuario en la base de datos usando el ID del token
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que la cuenta del usuario esté activa
    if (!user.isActive) {
      return res.status(403).json({ error: 'Cuenta de usuario desactivada' });
    }

    // ========================================================================================
    // INYECCIÓN DEL USUARIO EN REQUEST
    // ========================================================================================
    // Agregar usuario completo al objeto request para uso en controladores
    req.user = user;
    next(); // Continuar al siguiente middleware o controlador
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(500).json({ error: 'Error en la autenticación' });
  }
};

// ============================================================================================
// MIDDLEWARE DE AUTORIZACIÓN POR ROLES
// ============================================================================================
// Función: Verificar que el usuario tiene permisos específicos basados en roles
// Uso: Proteger rutas que requieren roles específicos (admin, moderator, etc.)
// Parámetros: Array de roles permitidos
const authorize = (roles = []) => {
  return (req, res, next) => {
    // ========================================================================================
    // VALIDACIÓN DE ROLES
    // ========================================================================================
    // Si no se especifican roles, cualquier usuario autenticado tiene acceso
    if (roles.length === 0) {
      return next();
    }
    
    // ========================================================================================
    // VERIFICACIÓN DE PERMISOS
    // ========================================================================================
    // Verificar que el usuario existe y tiene uno de los roles requeridos
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tiene permisos para acceder a este recurso' });
    }
    
    next(); // Usuario autorizado, continuar
  };
};

// ============================================================================================
// EXPORTACIÓN DE MIDDLEWARES
// ============================================================================================
module.exports = {
  authenticate, // Middleware de autenticación JWT
  authorize     // Middleware de autorización por roles
}; 