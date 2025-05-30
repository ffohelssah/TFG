// ================================================================================================
// CONFIGURACIÓN DE BASE DE DATOS - SEQUELIZE ORM
// ================================================================================================
// Este archivo configura la conexión a PostgreSQL usando Sequelize ORM.
// Gestiona:
// 1. Conexión a la base de datos PostgreSQL
// 2. Pool de conexiones para optimizar rendimiento
// 3. Configuración según el entorno (desarrollo/producción)
// 4. Exportación de instancia de Sequelize para uso en modelos
// ================================================================================================

// ============================================================================================
// IMPORTACIONES
// ============================================================================================
const { Sequelize, Op } = require('sequelize'); // ORM y operadores para consultas
const dotenv = require('dotenv');                // Variables de entorno

// Cargar variables de entorno
dotenv.config();

// ============================================================================================
// CONFIGURACIÓN DE SEQUELIZE
// ============================================================================================
// Crear instancia de Sequelize con configuración de PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME,      // Nombre de la base de datos (magic_cards)
  process.env.DB_USER,      // Usuario de PostgreSQL (postgres)
  process.env.DB_PASSWORD,  // Contraseña de PostgreSQL
  {
    host: process.env.DB_HOST,        // Host de la BD (localhost o contenedor 'db')
    port: process.env.DB_PORT,        // Puerto de PostgreSQL (5432)
    dialect: 'postgres',              // Tipo de base de datos
    
    // Configuración de logging según el entorno
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    // ========================================================================================
    // POOL DE CONEXIONES - OPTIMIZACIÓN DE RENDIMIENTO
    // ========================================================================================
    // Configuración del pool para manejar múltiples conexiones simultáneas
    pool: {
      max: 5,      // Máximo 5 conexiones simultáneas
      min: 0,      // Mínimo 0 conexiones (se crean bajo demanda)
      acquire: 30000, // Tiempo máximo para obtener conexión (30 segundos)
      idle: 10000     // Tiempo antes de cerrar conexión inactiva (10 segundos)
    }
  }
);

// ============================================================================================
// FUNCIÓN DE PRUEBA DE CONEXIÓN
// ============================================================================================
// Función asíncrona para verificar la conectividad con la base de datos
const testConnection = async () => {
  try {
    // Intentar autenticar conexión con la BD
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    return true;
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    return false;
  }
};

// ============================================================================================
// EXPORTACIONES
// ============================================================================================
module.exports = {
  sequelize,      // Instancia principal de Sequelize para modelos
  Op,             // Operadores de Sequelize para consultas avanzadas
  testConnection  // Función para verificar conectividad
}; 