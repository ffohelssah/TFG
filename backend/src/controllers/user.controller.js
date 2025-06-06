const { User } = require('../models');
const path = require('path');
const fs = require('fs');
const { sequelize } = require('../config/database');

// ================================================================================================
// CONTROLADOR DE USUARIOS - USER CONTROLLER
// ================================================================================================
// Este controlador maneja operaciones específicas de gestión de usuarios:
// 1. Actualización de perfiles con gestión de imágenes
// 2. Cambio de contraseñas con validación
// 3. Consulta de perfiles públicos
// 
// CARACTERÍSTICAS PRINCIPALES:
// - Gestión completa de imágenes de perfil (subida, actualización, eliminación)
// - Validación de unicidad de username y email
// - Verificación de contraseña actual antes de cambios
// - Respuestas seguras sin datos sensibles
// ================================================================================================

// ============================================================================================
// IMPORTACIONES
// ============================================================================================

// ============================================================================================
// ACTUALIZAR PERFIL DE USUARIO
// ============================================================================================
// Endpoint: PUT /api/users/profile
// Función: Modificar información del perfil incluyendo imagen
// Validaciones: Username y email únicos, usuario autenticado
// Gestión de archivos: Reemplazo automático de imagen anterior
const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user.id;

    // Verificar que no haya otro usuario con el mismo username o email
    if (username || email) {
      const existingUser = await User.findOne({
        where: {
          id: { [sequelize.Op.ne]: userId },
          [sequelize.Op.or]: [
            ...(username ? [{ username }] : []),
            ...(email ? [{ email }] : [])
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({ 
          error: 'Ya existe otro usuario con ese nombre de usuario o email' 
        });
      }
    }

    // Datos a actualizar
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    // Si hay una nueva imagen de perfil
    if (req.file) {
      // Eliminar imagen anterior (si no es la default)
      if (req.user.profilePicture) {
        const oldImagePath = path.join(__dirname, '../../', req.user.profilePicture);
        if (fs.existsSync(oldImagePath) && !req.user.profilePicture.includes('default')) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Actualizar con nueva imagen
      updateData.profilePicture = `/uploads/${req.file.filename}`;
    }

    // Actualizar usuario
    await req.user.update(updateData);

    // Devolver usuario actualizado (sin password)
    const userData = {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      profilePicture: req.user.profilePicture,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt
    };

    return res.status(200).json({
      message: 'Perfil actualizado correctamente',
      user: userData
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
};

// ============================================================================================
// CAMBIAR CONTRASEÑA
// ============================================================================================
// Endpoint: PUT /api/users/password
// Función: Actualizar contraseña del usuario
// Seguridad: Verificación obligatoria de contraseña actual
// Hashing: Automático mediante hooks del modelo User
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Verificar contraseña actual
    const isValid = await req.user.validatePassword(currentPassword);
    if (!isValid) {
      return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
    }

    // Actualizar contraseña
    await req.user.update({ password: newPassword });

    return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return res.status(500).json({ error: 'Error al cambiar la contraseña' });
  }
};

// ============================================================================================
// OBTENER PERFIL PÚBLICO
// ============================================================================================
// Endpoint: GET /api/users/:id/public
// Función: Recuperar información pública de cualquier usuario
// Filtrado: Solo datos no sensibles (sin email, sin password)
// Uso: Para mostrar información de vendedores/compradores
const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'profilePicture', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error al obtener perfil público:', error);
    return res.status(500).json({ error: 'Error al obtener el perfil público' });
  }
};

module.exports = {
  updateProfile,
  changePassword,
  getPublicProfile
}; 