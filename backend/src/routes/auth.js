const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validaciones básicas
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(400).json({ message: `User with this ${field} already exists` });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    // Generar token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30m' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generar token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30m' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Actualizar perfil
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user.id;

    // Validaciones básicas
    if (!username || !email) {
      return res.status(400).json({ message: 'Username and email are required' });
    }

    // Verificar si el username ya existe (excluyendo el usuario actual)
    const existingUsername = await User.findOne({ 
      where: { 
        username,
        id: { [Op.ne]: userId }
      }
    });

    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Verificar si el email ya existe (excluyendo el usuario actual)
    const existingEmail = await User.findOne({ 
      where: { 
        email,
        id: { [Op.ne]: userId }
      }
    });

    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Actualizar usuario
    await User.update(
      { username, email },
      { where: { id: userId } }
    );

    // Obtener usuario actualizado
    const updatedUser = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'createdAt']
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cambiar contraseña
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validaciones básicas
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Obtener usuario actual
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash de la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await User.update(
      { password: hashedNewPassword },
      { where: { id: userId } }
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Eliminar cuenta
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Nota: En una aplicación real, podrías querer:
    // 1. Eliminar en cascada todas las relaciones (cartas, chats, etc.)
    // 2. Marcar como eliminado en lugar de eliminar físicamente
    // 3. Enviar email de confirmación
    // 4. Tener un periodo de gracia para recuperar la cuenta

    // Por ahora, eliminamos directamente el usuario
    await User.destroy({ where: { id: userId } });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 