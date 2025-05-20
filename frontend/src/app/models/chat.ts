import { Market } from './market';
import { User } from './user';

export interface Chat {
  id?: number;
  userId1: number;
  userId2: number;
  marketId: number;
  roomId: string;
  isActive?: boolean;
  lastActivity?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  user1?: User;
  user2?: User;
  market?: Market;
} 