import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError, map } from 'rxjs';
import { Router } from '@angular/router';
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
  private tokenExpiryKey = 'auth_token_expiry';
  private sessionDurationMs = 30 * 60 * 1000; // 30 minutos en millisegundos
  private expiryTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Retrasar la carga del usuario hasta que Angular esté completamente inicializado
    setTimeout(() => {
      this.loadStoredUser();
    }, 100);
  }

  private loadStoredUser() {
    const token = localStorage.getItem(this.tokenKey);
    const expiry = localStorage.getItem(this.tokenExpiryKey);
    
    if (token && expiry) {
      const expiryTime = parseInt(expiry, 10);
      const currentTime = Date.now();
      const timeRemaining = expiryTime - currentTime;
      
      if (currentTime > expiryTime) {
        this.logout();
        return;
      }
      
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decoded = JSON.parse(jsonPayload);
        
        if (decoded && decoded.id) {
          this.getProfile().subscribe({
            next: (user) => {
              this.currentUserSubject.next(user);
              this.setupExpiryTimer();
            },
            error: (error) => {
              this.logout();
            }
          });
        } else {
          this.logout();
        }
      } catch (error) {
        this.logout();
      }
    }
  }

  private setupExpiryTimer() {
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
    }
    
    const expiry = localStorage.getItem(this.tokenExpiryKey);
    if (expiry) {
      const expiryTime = parseInt(expiry, 10);
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;
      
      if (timeUntilExpiry > 0) {
        this.expiryTimer = setTimeout(() => {
          this.logout();
        }, timeUntilExpiry);
      }
    }
  }

  private updateTokenExpiry() {
    const expiryTime = Date.now() + this.sessionDurationMs;
    localStorage.setItem(this.tokenExpiryKey, expiryTime.toString());
  }

  private extendSession() {
    const token = localStorage.getItem(this.tokenKey);
    const expiry = localStorage.getItem(this.tokenExpiryKey);
    
    if (token && expiry && this.isLoggedIn()) {
      const expiryTime = parseInt(expiry, 10);
      const currentTime = Date.now();
      const timeRemaining = expiryTime - currentTime;
      
      if (timeRemaining <= 15 * 60 * 1000) {
        this.updateTokenExpiry();
        this.setupExpiryTimer();
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
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
    
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.tokenExpiryKey);
    this.currentUserSubject.next(null);
    
    this.router.navigate(['/']);
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
        catchError((error) => {
          return this.handleError(error);
        })
      );
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    const expiry = localStorage.getItem(this.tokenExpiryKey);
    
    if (token && expiry) {
      const expiryTime = parseInt(expiry, 10);
      const currentTime = Date.now();
      
      if (currentTime > expiryTime) {
        this.logout();
        return null;
      }
      
      return token;
    }
    
    return null;
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    const expiry = localStorage.getItem(this.tokenExpiryKey);
    
    if (!token || !expiry) {
      return false;
    }
    
    const expiryTime = parseInt(expiry, 10);
    const currentTime = Date.now();
    
    if (currentTime > expiryTime) {
      this.logout();
      return false;
    }
    
    return true;
  }

  getSessionTimeRemaining(): number {
    const expiry = localStorage.getItem(this.tokenExpiryKey);
    if (expiry) {
      const expiryTime = parseInt(expiry, 10);
      const currentTime = Date.now();
      return Math.max(0, expiryTime - currentTime);
    }
    return 0;
  }

  extendSessionManually(): void {
    if (this.isLoggedIn()) {
      this.updateTokenExpiry();
      this.setupExpiryTimer();
    }
  }

  private storeAuthData(authResponse: AuthResponse) {
    localStorage.setItem(this.tokenKey, authResponse.token);
    this.updateTokenExpiry();
    this.currentUserSubject.next(authResponse.user);
    this.setupExpiryTimer();
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
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
    return throwError(() => new Error(errorMessage));
  }

  updateProfile(profileData: { username: string; email: string }): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, profileData).pipe(
      tap((updatedUser: User) => {
        this.currentUserSubject.next(updatedUser);
      })
    );
  }

  updatePassword(passwordData: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/password`, passwordData);
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/account`);
  }
}