import { Component, OnInit, OnDestroy, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';

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

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2
  ) {
    this.isDarkMode = this.themeService.isDarkMode();
  }

  ngOnInit() {
    // Detectar cambios de tema
    this.themeChangeListener = (e: any) => {
      this.isDarkMode = e.detail.darkMode;
      console.log('Header detected theme change, dark mode is now:', this.isDarkMode);
      
      // Forzar los estilos correctos
      this.forceNavItemStyles();
      
      this.cdr.detectChanges(); // Forzar actualización de la UI
    };
    
    document.addEventListener('themeChanged', this.themeChangeListener);
    
    // Aplicar estilos iniciales
    setTimeout(() => {
      this.forceNavItemStyles();
    }, 100);
  }

  ngOnDestroy() {
    // Limpiar listeners correctamente
    document.removeEventListener('themeChanged', this.themeChangeListener);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDarkMode();
    console.log('Theme toggled from header. Dark mode is now:', this.isDarkMode);
    
    // Forzar los estilos correctos después del cambio
    setTimeout(() => {
      this.forceNavItemStyles();
    }, 100);
  }

  logout() {
    this.authService.logout();
  }
  
  /**
   * Fuerza los estilos correctos en los elementos de navegación
   * independientemente del modo oscuro/claro
   */
  private forceNavItemStyles() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      // Asegurar que tengan el color correcto
      if (item.classList.contains('text-blue-600')) {
        this.renderer.setStyle(item, 'color', '#2563eb');
        // Usar !important con CSS en línea
        (item as HTMLElement).style.setProperty('color', '#2563eb', 'important');
      } else {
        this.renderer.setStyle(item, 'color', '#6B7280');
        // Usar !important con CSS en línea
        (item as HTMLElement).style.setProperty('color', '#6B7280', 'important');
      }
      
      // Desactivar transiciones
      this.renderer.setStyle(item, 'transition', 'none');
      (item as HTMLElement).style.setProperty('transition', 'none', 'important');
    });
  }
} 