import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.apiUrl.replace('/api', ''));
  }

  joinRoom(roomId: string): void {
    this.socket.emit('join_room', roomId);
  }

  leaveRoom(roomId: string): void {
    this.socket.emit('leave_room', roomId);
  }

  sendMessage(data: { room: string, message: Message }): void {
    this.socket.emit('send_message', data);
  }

  receiveMessage(): Observable<Message> {
    return new Observable(observer => {
      this.socket.on('receive_message', (data: Message) => {
        observer.next(data);
      });

      return () => {
        this.socket.off('receive_message');
      };
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
} 