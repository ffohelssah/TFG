import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chat } from '../models/chat';
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

  getChatMessages(chatId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/${chatId}`);
  }

  createChat(marketId: number, userId: number): Observable<Chat> {
    return this.http.post<Chat>(this.apiUrl, { marketId, userId });
  }

  sendMessage(chatId: number, content: string): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/${chatId}/messages`, { content });
  }

  markAsRead(chatId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${chatId}/read`, {});
  }
} 