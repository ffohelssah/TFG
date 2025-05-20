import { User } from './user';

export interface Card {
  id?: number;
  name: string;
  edition: string;
  condition: 'mint' | 'near mint' | 'excellent' | 'good' | 'light played' | 'played' | 'poor';
  imageUrl: string;
  description?: string;
  isListed?: boolean;
  price?: number;
  userId: number;
  user?: User;
  createdAt?: Date;
  updatedAt?: Date;
} 