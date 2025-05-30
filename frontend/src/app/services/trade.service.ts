// ================================================================================================
// SERVICIO DE INTERCAMBIOS - TRADE SERVICE
// ================================================================================================
// Este servicio maneja toda la lógica de frontend relacionada con el sistema de trading.
// Proporciona métodos para gestionar el ciclo completo de intercambio de cartas.
// 
// FUNCIONALIDADES PRINCIPALES:
// - Iniciación de propuestas de trade
// - Aceptación y rechazo de intercambios
// - Consulta de estado de trades activos
// - Sistema de doble confirmación (buyer + seller)
// 
// FLUJO DE TRADING:
// 1. Comprador inicia trade desde chat
// 2. Ambas partes deben aceptar
// 3. Transferencia automática al completar
// 4. Eliminación de chat tras finalizar
// 
// ESTADOS DE TRADE:
// - pending: Esperando respuesta inicial
// - buyer_accepted: Solo comprador ha aceptado
// - seller_accepted: Solo vendedor ha aceptado  
// - both_accepted: Ambos aceptaron, completando
// - completed: Trade finalizado exitosamente
// - rejected: Trade cancelado por una parte
// ================================================================================================

// ============================================================================================
// IMPORTACIONES
// ============================================================================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ============================================================================================
// INTERFACES DE TIPOS DE DATOS
// ============================================================================================

// ========================================================================================
// INTERFAZ PRINCIPAL DE TRADE
// ========================================================================================
// Define la estructura completa de un intercambio
// Incluye relaciones con usuario, mercado y carta
export interface Trade {
  id: number;                                    // ID único del trade
  chatId: number;                               // ID del chat asociado
  marketId: number;                             // ID del listado del mercado
  buyerId: number;                              // ID del comprador
  sellerId: number;                             // ID del vendedor
  price: number;                                // Precio del intercambio
  status: 'pending' | 'buyer_accepted' | 'seller_accepted' | 'both_accepted' | 'completed' | 'rejected';
  buyerAccepted: boolean;                       // Estado de aceptación del comprador
  sellerAccepted: boolean;                      // Estado de aceptación del vendedor
  buyerAcceptedAt?: string;                     // Timestamp de aceptación del comprador
  sellerAcceptedAt?: string;                    // Timestamp de aceptación del vendedor
  completedAt?: string;                         // Timestamp de finalización
  rejectedAt?: string;                          // Timestamp de rechazo
  rejectedBy?: number;                          // ID del usuario que rechazó
  createdAt: string;                            // Timestamp de creación
  updatedAt: string;                            // Timestamp de última actualización
  buyer?: {                                     // Información del comprador
    id: number;
    username: string;
    email: string;
  };
  seller?: {                                    // Información del vendedor
    id: number;
    username: string;
    email: string;
  };
  Market?: {                                    // Información del listado
    id: number;
    price: number;
    status: string;
    Card?: {                                    // Información de la carta
      id: number;
      name: string;
      edition: string;
      condition: string;
      imageUrl?: string;
    };
  };
}

// ========================================================================================
// INTERFACES DE RESPUESTA
// ========================================================================================
// Respuestas tipadas del backend para operaciones de trade
export interface TradeResponse {
  trade: Trade;                                 // Trade actualizado
  message: string;                              // Mensaje descriptivo
}

export interface ChatTradeResponse {
  trade: Trade | null;                          // Trade activo o null si no existe
}

// ============================================================================================
// CONFIGURACIÓN DEL SERVICIO
// ============================================================================================
// Injectable a nivel raíz, disponible en toda la aplicación
// Maneja comunicación HTTP con el backend de trades
@Injectable({
  providedIn: 'root'
})
export class TradeService {
  private apiUrl = `${environment.apiUrl}/trade`;

  constructor(private http: HttpClient) { }

  // ============================================================================================
  // MÉTODOS DE CONSULTA DE TRADES
  // ============================================================================================

  // ========================================================================================
  // OBTENER TRADE ACTIVO DE CHAT
  // ========================================================================================
  // Función: Recuperar información del trade activo en una conversación
  // Parámetros: chatId - ID del chat a consultar
  // Retorno: Trade activo con información completa o null si no existe
  // Uso: Mostrar controles de trade en la interfaz de chat
  getChatTrade(chatId: number): Observable<ChatTradeResponse> {
    return this.http.get<ChatTradeResponse>(`${this.apiUrl}/chat/${chatId}`);
  }

  // ============================================================================================
  // MÉTODOS DE GESTIÓN DE TRADES
  // ============================================================================================

  // ========================================================================================
  // INICIAR TRADE
  // ========================================================================================
  // Función: Crear nueva propuesta de intercambio en una conversación
  // Parámetros: chatId - ID del chat donde iniciar el trade
  // Restricciones: Solo compradores pueden iniciar, no vendedores
  // Retorno: Trade creado con estado 'pending'
  initiateTrade(chatId: number): Observable<TradeResponse> {
    return this.http.post<TradeResponse>(`${this.apiUrl}/chat/${chatId}/initiate`, {});
  }

  // ========================================================================================
  // ACEPTAR TRADE
  // ========================================================================================
  // Función: Confirmar participación en el intercambio
  // Parámetros: tradeId - ID del trade a aceptar
  // Lógica: Sistema de doble confirmación (buyer + seller)
  // Auto-completion: Si ambos aceptan, ejecuta transferencia automática
  acceptTrade(tradeId: number): Observable<TradeResponse> {
    return this.http.put<TradeResponse>(`${this.apiUrl}/${tradeId}/accept`, {});
  }

  // ========================================================================================
  // RECHAZAR TRADE
  // ========================================================================================
  // Función: Cancelar propuesta de intercambio
  // Parámetros: tradeId - ID del trade a rechazar
  // Efectos: Actualiza estado a 'rejected' y elimina chat completo
  // Retorno: Confirmación de rechazo con información del usuario que rechazó
  rejectTrade(tradeId: number): Observable<TradeResponse> {
    return this.http.put<TradeResponse>(`${this.apiUrl}/${tradeId}/reject`, {});
  }
} 