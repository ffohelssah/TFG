// ================================================================================================
// COMPONENTE PRINCIPAL DE LA APLICACIÓN - APP COMPONENT
// ================================================================================================
// Este es el componente raíz de la aplicación Angular standalone.
// Define la estructura base de la aplicación y maneja la inicialización global.
// 
// RESPONSABILIDADES:
// - Layout principal de la aplicación
// - Inicialización de servicios globales
// - Renderizado de componentes de infraestructura
// - Gestión del tema de la aplicación
// - Integración de componentes transversales
// 
// COMPONENTES INCLUIDOS:
// - Header: Navegación y controles de usuario
// - Footer: Información y enlaces adicionales
// - Router Outlet: Contenido dinámico de páginas
// - Modal: Sistema de modales global
// - Session Notification: Notificaciones de sesión
// ================================================================================================

// ============================================================================================
// IMPORTACIONES
// ============================================================================================
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/layout/header/header.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { SessionNotificationComponent } from './components/session-notification/session-notification.component';
import { ModalComponent } from './components/modal/modal.component';
import { ThemeService } from './services/theme.service';
import { ChatService } from './services/chat.service';
import { AuthService } from './services/auth.service';

// ============================================================================================
// CONFIGURACIÓN DEL COMPONENTE
// ============================================================================================
// Componente standalone que reemplaza el tradicional AppModule
// Incluye todos los componentes de infraestructura necesarios
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, SessionNotificationComponent, ModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [ChatService]                       // ChatService como provider local
})
export class AppComponent implements OnInit {
  title = 'Magic Cards';                         // Título de la aplicación
  
  constructor(
    private themeService: ThemeService,           // Servicio de gestión de temas
    private authService: AuthService              // Servicio de autenticación
  ) {}
  
  // ============================================================================================
  // INICIALIZACIÓN DEL COMPONENTE
  // ============================================================================================
  
  // ========================================================================================
  // HOOK DE INICIALIZACIÓN
  // ========================================================================================
  // Función: Configurar servicios globales después de la inicialización de Angular
  // Efectos: Garantiza la correcta inicialización del tema de la aplicación
  ngOnInit() {
    // Asegurar que el tema se inicialice correctamente
    // El constructor de ThemeService maneja la inicialización,
    // pero esto garantiza que se ejecute después de que Angular esté completamente inicializado
    const isDarkMode = this.themeService.isDarkMode();
  }
}
