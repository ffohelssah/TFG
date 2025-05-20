import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  getPublicProfile(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }

  updateProfile(profileData: FormData): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, profileData);
  }

  changePassword(data: { currentPassword: string, newPassword: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/password`, data);
  }
} 