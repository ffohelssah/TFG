import { Chat } from './chat';
import { User } from './user';

export interface Message {
  id?: number;
  chatId: number;
  senderId: number;
  content: string;
  read?: boolean;
  sentAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  chat?: Chat;
  sender?: User;
} 