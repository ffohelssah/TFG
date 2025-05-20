import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError, map } from 'rxjs';
import { User, AuthResponse } from '../models/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'auth_token';
  private http: HttpClient;

  constructor() {
    this.http = inject(HttpClient);
    this.loadStoredUser();
  }

  private loadStoredUser() {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      try {
        // Decode JWT token to get user data
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decoded = JSON.parse(jsonPayload);
        // Aquí solo obtenemos el ID y el rol del token, no el usuario completo
        if (decoded && decoded.id) {
          // Cargar el perfil del usuario
          this.getProfile().subscribe({
            next: (user) => this.currentUserSubject.next(user),
            error: () => this.logout()
          });
        }
      } catch (error) {
        console.error('Error parsing stored auth token', error);
        this.logout();
      }
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((response: AuthResponse) => {
          this.storeAuthData(response);
        }),
        catchError(this.handleError)
      );
  }

  register(user: User): Observable<AuthResponse> {
    console.log('Sending registration data:', user);
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, user)
      .pipe(
        tap((response: AuthResponse) => {
          this.storeAuthData(response);
        }),
        catchError(this.handleError)
      );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  getProfile(): Observable<User> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/profile`)
      .pipe(
        map(response => {
          if (response && response.user) {
            this.currentUserSubject.next(response.user);
            return response.user;
          }
          return {} as User;
        }),
        catchError(this.handleError)
      );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private storeAuthData(authResponse: AuthResponse) {
    localStorage.setItem(this.tokenKey, authResponse.token);
    this.currentUserSubject.next(authResponse.user);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.status === 400) {
        errorMessage = 'Invalid data. Please check your input.';
      } else if (error.status === 401) {
        errorMessage = 'Invalid credentials.';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
    }
    console.error('API error:', error);
    return throwError(() => new Error(errorMessage));
  }
} 