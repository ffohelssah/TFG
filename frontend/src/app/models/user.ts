// ================================================================================================
// MODELO DE USUARIO - USER MODEL
// ================================================================================================
// Define las interfaces TypeScript para la gestión de usuarios y autenticación.
// Establece la estructura de datos que se intercambia entre frontend y backend.
// 
// INTERFACES INCLUIDAS:
// - User: Datos completos del usuario
// - AuthResponse: Respuesta de autenticación con token y usuario
// 
// CAMPOS OPCIONALES:
// - id: Generado automáticamente por la base de datos
// - password: Solo se envía en registro, no se recibe del backend
// - role: Definido por defecto en el backend
// - timestamps: Gestionados automáticamente por Sequelize
// ================================================================================================

// ============================================================================================
// INTERFAZ PRINCIPAL DE USUARIO
// ============================================================================================
// Define la estructura completa de datos de un usuario
// Compatible con el modelo User de Sequelize en el backend
export interface User {
  id?: number;                                     // ID único del usuario (auto-generado)
  username: string;                                // Nombre de usuario único
  email: string;                                   // Email único para autenticación
  password?: string;                               // Contraseña (solo para registro/cambio)
  role?: string;                                   // Rol del usuario (por defecto 'user')
  createdAt?: Date;                                // Timestamp de creación automático
  updatedAt?: Date;                                // Timestamp de actualización automático
}

// ============================================================================================
// INTERFAZ DE RESPUESTA DE AUTENTICACIÓN
// ============================================================================================
// Define la estructura de respuesta para operaciones de login y registro
// Incluye token JWT y datos del usuario autenticado
export interface AuthResponse {
  token: string;                                   // Token JWT para autenticación
  user: User;                                      // Datos completos del usuario
}