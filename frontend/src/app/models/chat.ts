// ================================================================================================
// MODELO DE CHAT - CHAT MODEL
// ================================================================================================
// Define las interfaces TypeScript para el sistema de mensajería en tiempo real.
// Establece la estructura de datos para chats, mensajes y respuestas del sistema.
// 
// INTERFACES INCLUIDAS:
// - Chat: Conversación entre dos usuarios
// - Message: Mensaje individual dentro de un chat  
// - ChatResponse: Respuesta del backend para operaciones de chat
// 
// RELACIONES:
// - Chat pertenece a un Market (listado)
// - Chat tiene dos User (participantes)
// - Chat contiene múltiples Message
// - Message pertenece a un Chat y un User (sender)
// ================================================================================================

// ============================================================================================
// IMPORTACIONES
// ============================================================================================
import { Market } from './market';
import { User } from './user';

// ============================================================================================
// INTERFAZ PRINCIPAL DE CHAT
// ============================================================================================
// Define la estructura de una conversación entre dos usuarios
// Asociada a un listado específico del marketplace
export interface Chat {
  id: number;                                      // ID único del chat
  marketId: number;                                // ID del listado asociado
  userId1: number;                                 // ID del primer participante
  userId2: number;                                 // ID del segundo participante
  roomId?: string;                                 // ID de sala para WebSocket
  isActive?: boolean;                              // Estado activo del chat
  lastActivity?: Date;                             // Timestamp de última actividad
  createdAt: Date;                                 // Timestamp de creación
  updatedAt: Date;                                 // Timestamp de actualización
  market?: Market;                                 // Información del listado (lowercase)
  Market?: Market;                                 // Compatibilidad con backend (uppercase)
  user1?: User;                                    // Información del primer participante
  user2?: User;                                    // Información del segundo participante
  messages?: Message[];                            // Lista de mensajes del chat
}

// ============================================================================================
// INTERFAZ DE MENSAJE
// ============================================================================================
// Define la estructura de un mensaje individual dentro de una conversación
// Incluye información del remitente y timestamps
export interface Message {
  id: number;                                      // ID único del mensaje
  chatId: number;                                  // ID del chat contenedor
  senderId: number;                                // ID del usuario remitente
  content: string;                                 // Contenido del mensaje
  createdAt: Date;                                 // Timestamp de envío
  updatedAt: Date;                                 // Timestamp de actualización
  sender?: User;                                   // Información del remitente
}

// ============================================================================================
// INTERFAZ DE RESPUESTA DE CHAT
// ============================================================================================
// Define la estructura de respuesta para operaciones de chat del backend
// Incluye mensaje descriptivo y datos del chat
export interface ChatResponse {
  message?: string;                                // Mensaje descriptivo de la operación
  chat: Chat;                                      // Datos completos del chat
} 