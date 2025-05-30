// ================================================================================================
// INTERCEPTOR DE AUTENTICACIÓN - AUTH INTERCEPTOR
// ================================================================================================
// Este interceptor HTTP automáticamente adjunta tokens JWT a todas las peticiones salientes.
// Implementa HttpInterceptorFn de Angular para interceptar y modificar requests HTTP.
// 
// FUNCIONALIDADES:
// - Inyección automática de tokens Bearer en headers
// - Verificación de validez del token antes del envío
// - Aplicación transparente a todas las peticiones HTTP
// - Manejo de peticiones con y sin autenticación
// 
// COMPORTAMIENTO:
// - Si existe token válido: Agrega header Authorization con Bearer token
// - Si no hay token: Envía petición sin modificar
// - Opera de forma transparente sin afectar el código de componentes
// 
// CONFIGURACIÓN:
// Se registra en app.config.ts con provideHttpClient(withInterceptors([authInterceptor]))
// ================================================================================================

// ============================================================================================
// IMPORTACIONES
// ============================================================================================
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// ============================================================================================
// INTERCEPTOR DE AUTENTICACIÓN
// ============================================================================================
// Función interceptor que implementa HttpInterceptorFn
// Procesa automáticamente todas las peticiones HTTP salientes
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // ========================================================================================
  // INYECCIÓN DE DEPENDENCIAS
  // ========================================================================================
  const authService = inject(AuthService);         // Servicio de autenticación

  // ========================================================================================
  // OBTENER TOKEN VÁLIDO
  // ========================================================================================
  // AuthService.getToken() valida expiración y retorna token o null
  const token = authService.getToken();

  // ========================================================================================
  // INYECCIÓN DE TOKEN EN HEADERS
  // ========================================================================================
  if (token) {
    // Clonar request para modificar headers (requests son inmutables)
    // Agregar header Authorization con formato Bearer estándar
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);                           // Enviar request modificado
  }

  // ========================================================================================
  // ENVÍO SIN MODIFICAR
  // ========================================================================================
  // Si no hay token, enviar request original sin modificaciones
  return next(req);
}; 