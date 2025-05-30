import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError, map } from 'rxjs';
import { Router } from '@angular/router';
import { User, AuthResponse } from '../models/user';
import { environment } from '../../environments/environment';

// ================================================================================================
// SERVICIO DE AUTENTICACIÓN - AUTH SERVICE
// ================================================================================================
// Este servicio centraliza toda la lógica de autenticación y autorización del frontend.
// Maneja el ciclo completo de sesiones de usuario incluyendo login, registro y gestión de tokens.
// 
// CARACTERÍSTICAS PRINCIPALES:
// - Gestión de tokens JWT con expiración automática
// - Sistema de renovación de sesión
// - Estado reactivo del usuario actual
// - Persistencia segura en localStorage
// - Auto-logout por expiración
// - Decodificación y validación de tokens
// 
// FUNCIONALIDADES:
// - Login y registro de usuarios
// - Gestión de perfiles y contraseñas
// - Verificación de estado de autenticación
// - Manejo de errores HTTP
// ================================================================================================

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

  // ========================================================================================
  // CARGA DE USUARIO ALMACENADO
  // ========================================================================================
  // Función: Restaurar sesión desde localStorage al inicializar
  // Validaciones: Token válido, no expirado, decodificación correcta
  // Efectos: Auto-logout si sesión inválida
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

  // ========================================================================================
  // CONFIGURACIÓN DE TIMER DE EXPIRACIÓN
  // ========================================================================================
  // Función: Programar logout automático basado en tiempo de expiración
  // Optimización: Limpia timers anteriores para evitar memory leaks
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

  // ============================================================================================
  // MÉTODOS PÚBLICOS DE AUTENTICACIÓN
  // ============================================================================================

  // ========================================================================================
  // LOGIN DE USUARIO
  // ========================================================================================
  // Función: Autenticar usuario con credenciales
  // Efectos: Almacena token, actualiza estado global, programa expiración
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

  // ========================================================================================
  // REGISTRO DE USUARIO
  // ========================================================================================
  // Función: Crear nueva cuenta de usuario
  // Efectos: Login automático después de registro exitoso
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

  // ========================================================================================
  // LOGOUT DE USUARIO
  // ========================================================================================
  // Función: Cerrar sesión y limpiar datos almacenados
  // Efectos: Limpia localStorage, cancela timers, redirecciona a home
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

  // ========================================================================================
  // OBTENER PERFIL DEL USUARIO
  // ========================================================================================
  // Función: Recuperar datos actualizados del usuario autenticado
  // Efectos: Actualiza estado global del usuario
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

  // ========================================================================================
  // OBTENER TOKEN VÁLIDO
  // ========================================================================================
  // Función: Recuperar token JWT si está válido y no expirado
  // Validaciones: Existencia, expiración, auto-logout si inválido
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

  // ========================================================================================
  // VERIFICAR ESTADO DE AUTENTICACIÓN
  // ========================================================================================
  // Función: Determinar si el usuario está logueado
  // Validaciones: Token válido y no expirado
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

  // ============================================================================================
  // MÉTODOS DE GESTIÓN DE PERFIL
  // ============================================================================================

  // ========================================================================================
  // ACTUALIZAR PERFIL
  // ========================================================================================
  // Función: Modificar información del perfil del usuario
  // Efectos: Actualiza estado global con datos nuevos
  updateProfile(profileData: { username: string; email: string }): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, profileData).pipe(
      tap((updatedUser: User) => {
        this.currentUserSubject.next(updatedUser);
      })
    );
  }

  // ========================================================================================
  // CAMBIAR CONTRASEÑA
  // ========================================================================================
  // Función: Actualizar contraseña del usuario autenticado
  // Validaciones: Contraseña actual requerida
  updatePassword(passwordData: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/password`, passwordData);
  }

  // ========================================================================================
  // ELIMINAR CUENTA
  // ========================================================================================
  // Función: Eliminar permanentemente la cuenta del usuario
  // Efectos: Eliminación completa de datos y cierre de sesión
  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/account`);
  }
}