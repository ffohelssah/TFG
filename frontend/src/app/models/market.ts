import { Card } from './card';
import { User } from './user';

export interface Market {
  id?: number;
  cardId: number;
  sellerId: number;
  price: number;
  status: 'available' | 'pending' | 'sold';
  description?: string;
  listedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Mantener Card para compatibilidad con el backend
  Card?: Card;
  
  // Añadir card para uso en el frontend
  card?: Card;
  
  seller?: User;
} 