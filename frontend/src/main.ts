// ================================================================================================
// PUNTO DE ENTRADA PRINCIPAL - FRONTEND ANGULAR APPLICATION
// ================================================================================================
// Este archivo es el punto de entrada de la aplicación Angular.
// Se ejecuta cuando se carga la aplicación en el navegador y:
// 1. Inicializa la aplicación Angular (standalone)
// 2. Carga la configuración principal
// 3. Monta el componente raíz en el DOM
// ================================================================================================

// ============================================================================================
// IMPORTACIONES PRINCIPALES
// ============================================================================================
import { bootstrapApplication } from '@angular/platform-browser'; // Función para inicializar app standalone
import { appConfig } from './app/app.config';                     // Configuración de la aplicación
import { AppComponent } from './app/app.component';               // Componente raíz

// ============================================================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================================================================
// Inicializar aplicación Angular con configuración standalone (sin NgModule)
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err)); // Capturar y mostrar errores de inicialización
