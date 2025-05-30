// ================================================================================================
// SERVICIO DE CHAT - CHAT SERVICE
// ================================================================================================
// Este servicio maneja toda la comunicación HTTP relacionada con el sistema de mensajería.
// Proporciona métodos para gestionar chats, mensajes y notificaciones de lectura.
// 
// FUNCIONALIDADES PRINCIPALES:
// - Gestión de conversaciones entre usuarios
// - Envío y recepción de mensajes
// - Control de estados de lectura
// - Contadores de mensajes no leídos
// - Creación de chats para listados del mercado
// - Limpieza de chats huérfanos
// 
// INTEGRACIÓN:
// - Trabaja con SocketService para tiempo real
// - Se conecta con backend API de chat
// - Maneja tipos de datos Chat y Message
// ================================================================================================

// ============================================================================================
// IMPORTACIONES
// ============================================================================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chat, ChatResponse } from '../models/chat';
import { Message } from '../models/message';
import { environment } from '../../environments/environment';

// ============================================================================================
// CONFIGURACIÓN DEL SERVICIO
// ============================================================================================
// Injectable a nivel raíz, disponible en toda la aplicación
// Maneja comunicación HTTP con el backend de chat
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) { }

  // ============================================================================================
  // MÉTODOS DE GESTIÓN DE CHATS
  // ============================================================================================

  // ========================================================================================
  // OBTENER CHATS DEL USUARIO
  // ========================================================================================
  // Función: Recuperar todas las conversaciones activas del usuario
  // Retorno: Lista de chats con información de participantes y último mensaje
  // Uso: Mostrar lista de conversaciones en la página de chat
  getUserChats(): Observable<Chat[]> {
    return this.http.get<Chat[]>(this.apiUrl);
  }

  // ========================================================================================
  // OBTENER MENSAJES DE CHAT
  // ========================================================================================
  // Función: Recuperar historial completo de mensajes de una conversación
  // Parámetros: chatId - ID del chat a consultar
  // Efectos: Marca automáticamente mensajes como leídos en el backend
  // Retorno: Mensajes, información del chat y roomId para WebSocket
  getChatMessages(chatId: number): Observable<{messages: Message[], chat: Chat, roomId: string}> {
    return this.http.get<{messages: Message[], chat: Chat, roomId: string}>(`${this.apiUrl}/${chatId}/messages`);
  }

  // ========================================================================================
  // CREAR NUEVO CHAT
  // ========================================================================================
  // Función: Iniciar conversación con vendedor desde listado del mercado
  // Parámetros: marketId - ID del listado, sellerId - ID del vendedor
  // Validaciones: No permite crear chat consigo mismo
  // Retorno: Información del chat creado o existente
  createChat(marketId: number, sellerId: number): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(this.apiUrl, { marketId, sellerId });
  }

  // ============================================================================================
  // MÉTODOS DE GESTIÓN DE MENSAJES
  // ============================================================================================

  // ========================================================================================
  // ENVIAR MENSAJE
  // ========================================================================================
  // Función: Crear y enviar nuevo mensaje en una conversación
  // Parámetros: chatId - ID del chat, content - contenido del mensaje
  // Efectos: Actualiza última actividad del chat en el backend
  // Retorno: Mensaje creado con información del remitente
  sendMessage(chatId: number, content: string): Observable<{message: Message}> {
    return this.http.post<{message: Message}>(`${this.apiUrl}/${chatId}/messages`, { content });
  }

  // ========================================================================================
  // MARCAR MENSAJES COMO LEÍDOS
  // ========================================================================================
  // Función: Marcar todos los mensajes no leídos del chat como leídos
  // Parámetros: chatId - ID del chat
  // Uso: Actualizar estado de notificaciones cuando se abre un chat
  markAsRead(chatId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${chatId}/read`, {});
  }

  // ============================================================================================
  // MÉTODOS DE NOTIFICACIONES
  // ============================================================================================

  // ========================================================================================
  // OBTENER CONTEO DE MENSAJES NO LEÍDOS
  // ========================================================================================
  // Función: Calcular total de mensajes no leídos para badges de notificación
  // Retorno: Total global y lista de chats con mensajes pendientes
  // Uso: Actualizar contador en navegación y lista de chats
  getUnreadCounts(): Observable<{totalUnread: number, unreadChatIds: number[]}> {
    return this.http.get<{totalUnread: number, unreadChatIds: number[]}>(`${this.apiUrl}/unread/counts`);
  }

  // ============================================================================================
  // MÉTODOS DE MANTENIMIENTO
  // ============================================================================================

  // ========================================================================================
  // LIMPIAR CHATS HUÉRFANOS
  // ========================================================================================
  // Función: Eliminar chats que perdieron su listado asociado
  // Uso: Mantenimiento de base de datos, herramienta de administración
  // Retorno: Información sobre chats eliminados
  cleanupOrphanedChats(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cleanup/orphaned`);
  }
} 