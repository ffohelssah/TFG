import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';
import { NotificationService } from '../../../services/notification.service';
import { SessionNotificationService } from '../../../services/session-notification.service';
import { Observable, interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isDarkMode = false;
  private themeChangeListener: any;
  unreadMessagesCount$: Observable<number>;
  
  // Propiedades para el indicador de sesión
  sessionTimeRemaining = 0;
  showSessionWarning = false;
  private sessionTimerSubscription?: Subscription;
  private lastWarningTime = 0;

  // Propiedades para el tooltip
  showTooltip = false;
  showTooltipMobile = false;
  tooltipX = 0;
  tooltipY = 0;
  tooltipMobileX = 0;
  tooltipMobileY = 0;

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private notificationService: NotificationService,
    private sessionNotificationService: SessionNotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.isDarkMode = this.themeService.isDarkMode();
    this.unreadMessagesCount$ = this.notificationService.unreadMessagesCount$;
    
    // Debug: suscribirse a los cambios de notificaciones
    this.unreadMessagesCount$.subscribe(count => {
      console.log('Header - Unread messages count changed:', count);
    });
  }

  ngOnInit() {
    // Detectar cambios de tema
    this.themeChangeListener = (e: any) => {
      this.isDarkMode = e.detail.darkMode;
      console.log('Header detected theme change, dark mode is now:', this.isDarkMode);
      
      // Aplicar estilos básicos sin interferir con hover
      this.forceNavItemStyles();
      
      this.cdr.detectChanges(); // Forzar actualización de la UI
    };
    
    document.addEventListener('themeChanged', this.themeChangeListener);
    
    // Aplicar estilos iniciales
    setTimeout(() => {
      this.forceNavItemStyles();
    }, 100);

    // Iniciar el timer de sesión si está logueado
    this.startSessionTimer();
  }

  ngOnDestroy() {
    // Limpiar listeners correctamente
    document.removeEventListener('themeChanged', this.themeChangeListener);
    
    // Limpiar suscripción del timer
    if (this.sessionTimerSubscription) {
      this.sessionTimerSubscription.unsubscribe();
    }
  }

  private startSessionTimer() {
    // Actualizar cada segundo
    this.sessionTimerSubscription = interval(1000).subscribe(() => {
      if (this.authService.isLoggedIn()) {
        this.sessionTimeRemaining = this.authService.getSessionTimeRemaining();
        
        // Mostrar advertencia si quedan menos de 5 minutos
        this.showSessionWarning = this.sessionTimeRemaining <= 5 * 60 * 1000 && this.sessionTimeRemaining > 0;
        
        // Mostrar notificación toast cuando quedan 2 minutos (solo una vez)
        if (this.sessionTimeRemaining <= 2 * 60 * 1000 && 
            this.sessionTimeRemaining > 1 * 60 * 1000 && 
            this.lastWarningTime !== 2) {
          this.sessionNotificationService.showSessionWarning(this.sessionTimeRemaining);
          this.lastWarningTime = 2;
        }
        
        // Mostrar notificación toast cuando queda 1 minuto (solo una vez)
        if (this.sessionTimeRemaining <= 1 * 60 * 1000 && 
            this.sessionTimeRemaining > 0 && 
            this.lastWarningTime !== 1) {
          this.sessionNotificationService.showSessionWarning(this.sessionTimeRemaining);
          this.lastWarningTime = 1;
        }
        
        this.cdr.detectChanges();
      } else {
        this.sessionTimeRemaining = 0;
        this.showSessionWarning = false;
        this.lastWarningTime = 0;
      }
    });
  }

  formatTimeRemaining(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  extendSession() {
    this.authService.extendSessionManually();
    this.showSessionWarning = false;
    this.lastWarningTime = 0; // Reset warning tracker
    this.sessionNotificationService.showSessionExtended();
    this.sessionNotificationService.hideNotification();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDarkMode();
    console.log('Theme toggled from header. Dark mode is now:', this.isDarkMode);
    
    // Permitir que CSS maneje los cambios de tema
    setTimeout(() => {
      this.forceNavItemStyles();
    }, 50);
  }

  logout() {
    this.authService.logout();
  }
  
  /**
   * Aplica estilos básicos en los elementos de navegación sin interferir con hover
   */
  private forceNavItemStyles() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      // Solo remover las propiedades inline que puedan interferir
      (item as HTMLElement).style.removeProperty('color');
      (item as HTMLElement).style.removeProperty('transition');
      
      // Permitir que CSS maneje los colores y transiciones
      item.classList.add('nav-fixed-color');
    });
  }

  // Métodos para manejar el tooltip
  onMouseMove(event: MouseEvent) {
    // Posicionar el tooltip cerca del cursor con mejor lógica
    const offset = 15;
    const tooltipWidth = 150; // Ancho aproximado del tooltip
    const tooltipHeight = 30; // Alto aproximado del tooltip
    
    // Calcular posición X
    let x = event.clientX + offset;
    if (x + tooltipWidth > window.innerWidth) {
      x = event.clientX - tooltipWidth - offset;
    }
    
    // Calcular posición Y
    let y = event.clientY - tooltipHeight - offset;
    if (y < 0) {
      y = event.clientY + offset;
    }
    
    this.tooltipX = x;
    this.tooltipY = y;
  }

  onMouseMoveMobile(event: MouseEvent) {
    // Similar lógica para móvil
    const offset = 15;
    const tooltipWidth = 150;
    const tooltipHeight = 30;
    
    let x = event.clientX + offset;
    if (x + tooltipWidth > window.innerWidth) {
      x = event.clientX - tooltipWidth - offset;
    }
    
    let y = event.clientY - tooltipHeight - offset;
    if (y < 0) {
      y = event.clientY + offset;
    }
    
    this.tooltipMobileX = x;
    this.tooltipMobileY = y;
  }
} 