import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  user: User = {
    username: '',
    email: '',
    password: ''
  };
  confirmPassword = '';
  error = '';
  loading = false;
  private themeChangeListener: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private renderer: Renderer2
  ) {}

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
    // Reset error state
    this.error = '';

    // Validación del formulario
    if (!this.user.username || !this.user.email || !this.user.password || !this.confirmPassword) {
      this.error = 'Please fill in all fields';
      return;
    }

    if (this.user.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    // Validación básica de formato
    if (this.user.password.length < 6) {
      this.error = 'Password must be at least 6 characters long';
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(this.user.email)) {
      this.error = 'Please enter a valid email address';
      return;
    }

    if (this.user.username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(this.user.username)) {
      this.error = 'Username must be at least 3 characters and contain only letters, numbers and underscores';
      return;
    }

    // Inicio del proceso de registro
    this.loading = true;
    console.log('Submitting registration form', this.user);

    this.authService.register(this.user).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Registration error', err);
        this.error = err.message || 'Registration failed. Please try again.';
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