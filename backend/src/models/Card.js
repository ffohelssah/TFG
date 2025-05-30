const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

// ================================================================================================
// MODELO DE CARTA - CARD MODEL
// ================================================================================================
// Este modelo define la estructura de las cartas coleccionables en el sistema.
// Representa las cartas que los usuarios pueden añadir a su colección personal.
// 
// CAMPOS PRINCIPALES:
// - id: Identificador único auto-incremental
// - name: Nombre de la carta (requerido)
// - edition: Edición o set de la carta (requerido)
// - condition: Estado físico de la carta (enum predefinido)
// - imageUrl: URL de la imagen de la carta (requerido)
// - description: Descripción adicional (opcional)
// - isListed: Indica si está listada en el mercado
// - price: Precio cuando está en el mercado (opcional)
// - userId: ID del propietario (foreign key a User)
// 
// CARACTERÍSTICAS:
// - Enumeración estricta para condiciones físicas
// - Relación con usuario propietario
// - Estado de mercado integrado
// ================================================================================================

// ============================================================================================
// IMPORTACIONES
// ============================================================================================

// ============================================================================================
// DEFINICIÓN DEL MODELO
// ============================================================================================
// Sequelize model con campos específicos para cartas coleccionables
// Incluye enum para condiciones y referencias a usuario propietario

const Card = sequelize.define('Card', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  edition: {
    type: DataTypes.STRING,
    allowNull: false
  },
  condition: {
    type: DataTypes.ENUM('mint', 'near mint', 'excellent', 'good', 'light played', 'played', 'poor'),
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isListed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  timestamps: true
});

// ============================================================================================
// RELACIONES
// ============================================================================================
// Relaciones definidas en models/index.js
// - belongsTo User (propietario)
// - hasOne Market (listado en mercado)
// - hasMany Chat through Market (conversaciones sobre la carta)

module.exports = Card; 