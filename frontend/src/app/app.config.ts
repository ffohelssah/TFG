// ================================================================================================
// CONFIGURACIÓN PRINCIPAL DE LA APLICACIÓN - APP CONFIG
// ================================================================================================
// Este archivo centraliza toda la configuración de la aplicación Angular standalone.
// Define los providers globales, interceptors y servicios que estarán disponibles
// en toda la aplicación sin necesidad de NgModule.
// 
// CONFIGURACIÓN INCLUIDA:
// - Zone.js con optimizaciones de performance
// - Router con todas las rutas de la aplicación
// - HttpClient con interceptor de autenticación
// - Animations para transiciones y efectos
// - Servicios globales (Auth, Chat)
// ================================================================================================

// ============================================================================================
// IMPORTACIONES
// ============================================================================================
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { ChatService } from './services/chat.service';
import { AuthService } from './services/auth.service';

// ============================================================================================
// CONFIGURACIÓN DE PROVIDERS
// ============================================================================================
// Configuración standalone que reemplaza el tradicional app.module.ts
// Incluye optimizaciones y servicios esenciales para toda la aplicación
export const appConfig: ApplicationConfig = {
  providers: [
    // Optimización de Zone.js para mejor performance
    provideZoneChangeDetection({ eventCoalescing: true }), 
    
    // Sistema de routing con todas las rutas definidas
    provideRouter(routes),
    
    // Cliente HTTP con interceptor automático de JWT
    provideHttpClient(withInterceptors([authInterceptor])),
    
    // Animaciones para transiciones y efectos visuales
    provideAnimations(),
    
    // Servicios globales disponibles en toda la aplicación
    ChatService,
    AuthService
  ]
};
