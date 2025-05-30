// ================================================================================================
// GUARD DE AUTENTICACIÓN - AUTH GUARD
// ================================================================================================
// Este guard protege las rutas que requieren autenticación en la aplicación.
// Implementa la interfaz CanActivateFn de Angular para validar acceso a rutas protegidas.
// 
// FUNCIONALIDADES:
// - Verificación de estado de autenticación
// - Redirección automática a login si no autenticado
// - Preservación de URL de destino para redirección post-login
// - Integración con AuthService para validación
// 
// COMPORTAMIENTO:
// - Permite acceso si usuario está logueado
// - Redirige a /login con returnUrl si no autenticado
// - Funciona con tokens JWT y validación de expiración
// 
// USO EN RUTAS:
// { path: 'protected', component: ProtectedComponent, canActivate: [authGuard] }
// ================================================================================================

// ============================================================================================
// IMPORTACIONES
// ============================================================================================
import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// ============================================================================================
// GUARD DE AUTENTICACIÓN
// ============================================================================================
// Función guard que implementa CanActivateFn para protección de rutas
// Utiliza dependency injection para acceder a servicios necesarios
export const authGuard: CanActivateFn = (route, state) => {
  // ========================================================================================
  // INYECCIÓN DE DEPENDENCIAS
  // ========================================================================================
  const authService = inject(AuthService);         // Servicio de autenticación
  const router = inject(Router);                   // Router para navegación

  // ========================================================================================
  // VALIDACIÓN DE AUTENTICACIÓN
  // ========================================================================================
  // Verificar si el usuario está autenticado mediante AuthService
  // AuthService.isLoggedIn() valida token y expiración
  if (authService.isLoggedIn()) {
    return true;                                   // Permitir acceso a la ruta
  } else {
    // =====================================================================================
    // REDIRECCIÓN A LOGIN
    // =====================================================================================
    // Redirigir a página de login preservando la URL de destino
    // queryParams.returnUrl permite redirección automática post-login
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;                                  // Denegar acceso a la ruta
  }
}; 