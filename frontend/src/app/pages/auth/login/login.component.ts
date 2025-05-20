import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  email = '';
  password = '';
  error = '';
  loading = false;
  returnUrl = '/';
  private themeChangeListener: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private themeService: ThemeService,
    private renderer: Renderer2
  ) {
    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  ngOnInit() {
    // Detectar cambios de tema
    this.themeChangeListener = () => {
      // Forzar los estilos correctos
      this.forceFixedTextColors();
    };
    
    document.addEventListener('themeChanged', this.themeChangeListener);
    
    // Aplicar estilos iniciales
    setTimeout(() => {
      this.forceFixedTextColors();
    }, 100);
  }

  ngOnDestroy() {
    // Limpiar listeners
    document.removeEventListener('themeChanged', this.themeChangeListener);
  }

  onSubmit() {
    this.error = '';
    this.loading = true;

    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields';
      this.loading = false;
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.error = err.error?.message || 'Login failed. Please check your credentials.';
        this.loading = false;
      }
    });
  }

  /**
   * Fuerza el color negro en los textos específicos independientemente del modo
   */
  private forceFixedTextColors() {
    const fixedTextElements = document.querySelectorAll('.fixed-text-color');
    fixedTextElements.forEach(el => {
      this.renderer.setStyle(el, 'color', '#1f2937');
      (el as HTMLElement).style.setProperty('color', '#1f2937', 'important');
      (el as HTMLElement).style.setProperty('transition', 'none', 'important');
    });
  }
} 