import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Trade {
  id: number;
  chatId: number;
  marketId: number;
  buyerId: number;
  sellerId: number;
  price: number;
  status: 'pending' | 'buyer_accepted' | 'seller_accepted' | 'both_accepted' | 'completed' | 'rejected';
  buyerAccepted: boolean;
  sellerAccepted: boolean;
  buyerAcceptedAt?: string;
  sellerAcceptedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  rejectedBy?: number;
  createdAt: string;
  updatedAt: string;
  buyer?: {
    id: number;
    username: string;
    email: string;
  };
  seller?: {
    id: number;
    username: string;
    email: string;
  };
  Market?: {
    id: number;
    price: number;
    status: string;
    Card?: {
      id: number;
      name: string;
      edition: string;
      condition: string;
      imageUrl?: string;
    };
  };
}

export interface TradeResponse {
  trade: Trade;
  message: string;
}

export interface ChatTradeResponse {
  trade: Trade | null;
}

@Injectable({
  providedIn: 'root'
})
export class TradeService {
  private apiUrl = `${environment.apiUrl}/trade`;

  constructor(private http: HttpClient) { }

  // Obtener trade activo de un chat
  getChatTrade(chatId: number): Observable<ChatTradeResponse> {
    return this.http.get<ChatTradeResponse>(`${this.apiUrl}/chat/${chatId}`);
  }

  // Iniciar un trade
  initiateTrade(chatId: number): Observable<TradeResponse> {
    return this.http.post<TradeResponse>(`${this.apiUrl}/chat/${chatId}/initiate`, {});
  }

  // Aceptar un trade
  acceptTrade(tradeId: number): Observable<TradeResponse> {
    return this.http.put<TradeResponse>(`${this.apiUrl}/${tradeId}/accept`, {});
  }

  // Rechazar un trade
  rejectTrade(tradeId: number): Observable<TradeResponse> {
    return this.http.put<TradeResponse>(`${this.apiUrl}/${tradeId}/reject`, {});
  }
} 