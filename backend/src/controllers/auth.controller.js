// ================================================================================================
// CONTROLADOR DE AUTENTICACIÓN - AUTH CONTROLLER
// ================================================================================================
// Este controlador maneja todas las operaciones relacionadas con la autenticación y autorización:
// 1. Registro de nuevos usuarios
// 2. Login y generación de tokens JWT
// 3. Gestión de perfiles de usuario
// 4. Cambio de contraseñas
// 5. Eliminación de cuentas
// 
// SEGURIDAD IMPLEMENTADA:
// - Verificación de credenciales
// - Validación de usuarios únicos
// - Hashing de contraseñas (en modelo User)
// - Tokens JWT para sesiones
// - Filtrado de datos sensibles en respuestas
// ================================================================================================

// ============================================================================================
// IMPORTACIONES
// ============================================================================================
const { User } = require('../models');            // Modelo de usuario
const { generateToken } = require('../config/jwt'); // Utilidad para generar JWT
const { sequelize, Op } = require('../config/database'); // Operadores de Sequelize

// ============================================================================================
// REGISTRO DE NUEVO USUARIO
// ============================================================================================
// Endpoint: POST /api/auth/register
// Función: Crear una nueva cuenta de usuario en el sistema
// Validaciones: Username y email únicos, datos requeridos
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log('Datos de registro recibidos:', { username, email, password: '***' });

    // ========================================================================================
    // VALIDACIÓN DE USUARIOS EXISTENTES
    // ========================================================================================
    // Verificar si ya existe un usuario con el mismo username o email
    const existingUserByUsername = await User.findOne({ where: { username } });
    const existingUserByEmail = await User.findOne({ where: { email } });

    if (existingUserByUsername || existingUserByEmail) {
      return res.status(400).json({ 
        error: 'Ya existe un usuario con ese nombre de usuario o email' 
      });
    }

    // ========================================================================================
    // CREACIÓN DEL USUARIO
    // ========================================================================================
    // Crear nuevo usuario (el password se hashea automáticamente en el modelo)
    const user = await User.create({
      username,
      email,
      password
    });

    // ========================================================================================
    // GENERACIÓN DE TOKEN JWT
    // ========================================================================================
    // Crear token de autenticación para sesión inmediata
    const token = generateToken({ id: user.id, role: user.role });

    // ========================================================================================
    // RESPUESTA SEGURA
    // ========================================================================================
    // Devolver datos del usuario (excluyendo password) y token
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt
    };

    return res.status(201).json({ user: userData, token });
  } catch (error) {
    console.error('Error en el registro:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

// ============================================================================================
// LOGIN DE USUARIO
// ============================================================================================
// Endpoint: POST /api/auth/login
// Función: Autenticar usuario existente y crear sesión
// Validaciones: Credenciales válidas, cuenta activa
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ========================================================================================
    // BÚSQUEDA Y VALIDACIÓN DEL USUARIO
    // ========================================================================================
    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar si la cuenta está activa
    if (!user.isActive) {
      return res.status(403).json({ error: 'Cuenta de usuario desactivada' });
    }

    // ========================================================================================
    // VERIFICACIÓN DE CONTRASEÑA
    // ========================================================================================
    // Usar método del modelo para verificar password hasheado
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // ========================================================================================
    // GENERACIÓN DE TOKEN Y RESPUESTA
    // ========================================================================================
    // Generar token JWT para la sesión
    const token = generateToken({ id: user.id, role: user.role });

    // Preparar datos del usuario (sin información sensible)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt
    };

    return res.status(200).json({ user: userData, token });
  } catch (error) {
    console.error('Error en el login:', error);
    return res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

// ============================================================================================
// OBTENER PERFIL DE USUARIO AUTENTICADO
// ============================================================================================
// Endpoint: GET /api/auth/profile
// Función: Recuperar información del usuario actual (requiere autenticación)
// Middleware: Requiere token JWT válido
const getProfile = async (req, res) => {
  try {
    // ========================================================================================
    // ACCESO A USUARIO AUTENTICADO
    // ========================================================================================
    // El usuario ya está disponible en req.user gracias al middleware de autenticación
    const userData = {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      profilePicture: req.user.profilePicture,
      createdAt: req.user.createdAt
    };

    return res.status(200).json({ user: userData });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return res.status(500).json({ error: 'Error al obtener información del perfil' });
  }
};

// ============================================================================================
// ACTUALIZAR PERFIL DE USUARIO
// ============================================================================================
// Endpoint: PUT /api/auth/profile
// Función: Actualizar información básica del usuario (username, email)
// Validaciones: Username y email únicos en el sistema
const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user.id;

    // ========================================================================================
    // VALIDACIÓN DE UNICIDAD DE DATOS
    // ========================================================================================
    // Verificar que el nuevo username no esté en uso por otro usuario
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ 
        where: { 
          username,
          id: { [Op.ne]: userId } // Excluir al usuario actual
        }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Verificar que el nuevo email no esté en uso por otro usuario
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: userId } // Excluir al usuario actual
        }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // ========================================================================================
    // ACTUALIZACIÓN Y RESPUESTA
    // ========================================================================================
    // Actualizar datos en la base de datos
    await User.update(
      { username, email },
      { where: { id: userId } }
    );

    // Obtener usuario actualizado para respuesta
    const updatedUser = await User.findByPk(userId);
    const userData = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture,
      createdAt: updatedUser.createdAt
    };

    return res.status(200).json({ 
      user: userData, 
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Error updating profile' });
  }
};

// ============================================================================================
// CAMBIAR CONTRASEÑA
// ============================================================================================
// Endpoint: PUT /api/auth/change-password
// Función: Actualizar contraseña del usuario (requiere contraseña actual)
// Seguridad: Verificación de contraseña actual antes de permitir cambio
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // ========================================================================================
    // VERIFICACIÓN DE CONTRASEÑA ACTUAL
    // ========================================================================================
    // Obtener usuario y verificar contraseña actual
    const user = await User.findByPk(userId);
    const isCurrentPasswordValid = await user.validatePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // ========================================================================================
    // ACTUALIZACIÓN DE CONTRASEÑA
    // ========================================================================================
    // Actualizar contraseña (se hashea automáticamente en el modelo)
    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ error: 'Error changing password' });
  }
};

// ============================================================================================
// ELIMINAR CUENTA DE USUARIO
// ============================================================================================
// Endpoint: DELETE /api/auth/account
// Función: Eliminar completamente la cuenta del usuario
// Efecto: Elimina usuario y todos sus datos relacionados (cascada)
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // ========================================================================================
    // ELIMINACIÓN EN CASCADA
    // ========================================================================================
    // Eliminar usuario (las foreign keys con CASCADE eliminarán datos relacionados)
    await User.destroy({ where: { id: userId } });

    return res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return res.status(500).json({ error: 'Error deleting account' });
  }
};

// ============================================================================================
// EXPORTACIÓN DE FUNCIONES
// ============================================================================================
module.exports = {
  register,        // Registro de nuevos usuarios
  login,          // Autenticación de usuarios
  getProfile,     // Obtener perfil actual
  updateProfile,  // Actualizar perfil
  changePassword, // Cambiar contraseña
  deleteAccount   // Eliminar cuenta
}; 