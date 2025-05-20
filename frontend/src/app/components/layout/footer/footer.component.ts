import { Component, OnInit, Renderer2 } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();
  private themeChangeListener: any;

  constructor(
    private themeService: ThemeService, 
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    // Detectar cambios de tema
    this.themeChangeListener = () => {
      // Forzar los estilos correctos
      this.forceFooterTitleStyle();
    };
    
    document.addEventListener('themeChanged', this.themeChangeListener);
    
    // Aplicar estilos iniciales
    setTimeout(() => {
      this.forceFooterTitleStyle();
    }, 100);
  }

  ngOnDestroy() {
    // Limpiar listeners
    document.removeEventListener('themeChanged', this.themeChangeListener);
  }

  /**
   * Fuerza el estilo del título del footer para que sea siempre blanco
   */
  private forceFooterTitleStyle() {
    const footerTitle = document.querySelector('.footer-title');
    if (footerTitle) {
      this.renderer.setStyle(footerTitle, 'color', 'white');
      (footerTitle as HTMLElement).style.setProperty('color', 'white', 'important');
      (footerTitle as HTMLElement).style.setProperty('transition', 'none', 'important');
    }
  }
} 