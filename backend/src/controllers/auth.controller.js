const { User } = require('../models');
const { generateToken } = require('../config/jwt');
const { sequelize, Op } = require('../config/database');

// Registrar nuevo usuario
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log('Datos de registro recibidos:', { username, email, password: '***' });

    // Verificar si el usuario ya existe (usando sintaxis alternativa)
    const existingUserByUsername = await User.findOne({ where: { username } });
    const existingUserByEmail = await User.findOne({ where: { email } });

    if (existingUserByUsername || existingUserByEmail) {
      return res.status(400).json({ 
        error: 'Ya existe un usuario con ese nombre de usuario o email' 
      });
    }

    // Crear nuevo usuario
    const user = await User.create({
      username,
      email,
      password
    });

    // Generar token
    const token = generateToken({ id: user.id, role: user.role });

    // Devolver usuario (sin password) y token
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

// Login de usuario
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar si usuario está activo
    if (!user.isActive) {
      return res.status(403).json({ error: 'Cuenta de usuario desactivada' });
    }

    // Verificar contraseña
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = generateToken({ id: user.id, role: user.role });

    // Devolver usuario (sin password) y token
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

// Obtener perfil de usuario autenticado
const getProfile = async (req, res) => {
  try {
    // Usuario ya está en req.user gracias al middleware de autenticación
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

// Actualizar perfil de usuario
const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user.id;

    // Verificar si el nuevo username o email ya están en uso por otro usuario
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ 
        where: { 
          username,
          id: { [Op.ne]: userId }
        }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: userId }
        }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Actualizar usuario
    await User.update(
      { username, email },
      { where: { id: userId } }
    );

    // Obtener usuario actualizado
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

// Cambiar contraseña
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Verificar contraseña actual
    const user = await User.findByPk(userId);
    const isCurrentPasswordValid = await user.validatePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ error: 'Error changing password' });
  }
};

// Eliminar cuenta
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Eliminar usuario (esto también eliminará registros relacionados por las foreign keys)
    await User.destroy({ where: { id: userId } });

    return res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return res.status(500).json({ error: 'Error deleting account' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount
}; 