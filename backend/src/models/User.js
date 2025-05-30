const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

// ================================================================================================
// MODELO DE USUARIO - USER MODEL
// ================================================================================================
// Este modelo define la estructura y comportamiento de los usuarios en el sistema.
// Incluye funcionalidades de seguridad, validaciones y hooks para hashing de contraseñas.
// 
// CAMPOS PRINCIPALES:
// - id: Identificador único auto-incremental
// - username: Nombre de usuario único (3-30 caracteres)
// - email: Correo electrónico único y válido
// - password: Contraseña hasheada automáticamente
// - profilePicture: URL de imagen de perfil (opcional)
// - isActive: Estado activo del usuario (por defecto true)
// - role: Rol del usuario (user/admin, por defecto user)
// 
// CARACTERÍSTICAS DE SEGURIDAD:
// - Hash automático de contraseñas con bcrypt y salt
// - Validaciones de longitud y formato
// - Método para verificación de contraseñas
// ================================================================================================

// ============================================================================================
// IMPORTACIONES
// ============================================================================================

// ============================================================================================
// DEFINICIÓN DEL MODELO
// ============================================================================================
// Sequelize model con validaciones, hooks y configuración de timestamps
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// ============================================================================================
// MÉTODO DE VALIDACIÓN DE CONTRASEÑAS
// ============================================================================================
// Método de instancia para verificar contraseñas usando bcrypt
// Compara contraseña en texto plano con hash almacenado
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User; 