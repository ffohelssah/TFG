export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  profilePicture?: string;
  isActive?: boolean;
  role?: 'user' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
} 