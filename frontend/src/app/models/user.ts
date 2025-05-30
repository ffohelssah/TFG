export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
} 