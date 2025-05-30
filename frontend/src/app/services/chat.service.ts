import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chat, ChatResponse } from '../models/chat';
import { Message } from '../models/message';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) { }

  getUserChats(): Observable<Chat[]> {
    return this.http.get<Chat[]>(this.apiUrl);
  }

  getChatMessages(chatId: number): Observable<{messages: Message[], chat: Chat, roomId: string}> {
    return this.http.get<{messages: Message[], chat: Chat, roomId: string}>(`${this.apiUrl}/${chatId}/messages`);
  }

  createChat(marketId: number, sellerId: number): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(this.apiUrl, { marketId, sellerId });
  }

  sendMessage(chatId: number, content: string): Observable<{message: Message}> {
    return this.http.post<{message: Message}>(`${this.apiUrl}/${chatId}/messages`, { content });
  }

  markAsRead(chatId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${chatId}/read`, {});
  }

  getUnreadCounts(): Observable<{totalUnread: number, unreadChatIds: number[]}> {
    return this.http.get<{totalUnread: number, unreadChatIds: number[]}>(`${this.apiUrl}/unread/counts`);
  }

  cleanupOrphanedChats(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cleanup/orphaned`);
  }
} 