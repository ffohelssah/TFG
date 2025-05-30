import { Market } from './market';
import { User } from './user';

export interface Chat {
  id: number;
  marketId: number;
  userId1: number;
  userId2: number;
  roomId?: string;
  isActive?: boolean;
  lastActivity?: Date;
  createdAt: Date;
  updatedAt: Date;
  market?: Market;
  Market?: Market; // Compatibilidad con el backend que devuelve Market con M mayúscula
  user1?: User;
  user2?: User;
  messages?: Message[];
}

export interface Message {
  id: number;
  chatId: number;
  senderId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  sender?: User;
}

export interface ChatResponse {
  message?: string;
  chat: Chat;
} 