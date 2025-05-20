import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MarketService } from '../../services/market.service';
import { Market } from '../../models/market';
import { AuthService } from '../../services/auth.service';
import { MarketItemComponent } from '../../components/market/market-item/market-item.component';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MarketItemComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredListings: Market[] = [];
  isLoading = true;
  error = '';
  isDarkMode = false;

  constructor(
    private marketService: MarketService,
    public authService: AuthService,
    public themeService: ThemeService
  ) {
    // Inicializar el estado del tema
    this.isDarkMode = this.themeService.isDarkMode();
  }

  ngOnInit() {
    this.loadFeaturedListings();
    
    // Detectar el modo actual
    this.isDarkMode = document.documentElement.classList.contains('dark');
    console.log('Home component initialized with dark mode:', this.isDarkMode);
    
    // Añadir un listener para cambios de tema
    document.addEventListener('themeChanged', () => {
      this.isDarkMode = document.documentElement.classList.contains('dark');
      console.log('Theme changed. Dark mode is now:', this.isDarkMode);
    });
  }
  
  ngOnDestroy() {
    // Limpiar los listeners
    document.removeEventListener('themeChanged', () => {});
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDarkMode();
    console.log('Theme toggled from home. Dark mode is now:', this.isDarkMode);
  }

  loadFeaturedListings() {
    this.isLoading = true;
    try {
      this.marketService.getListings({ limit: 4 }).subscribe({
        next: (response) => {
          if (response && response.listings) {
            this.featuredListings = response.listings;
          } else {
            this.featuredListings = [];
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to load featured listings';
          this.isLoading = false;
          console.error(err);
        }
      });
    } catch (err) {
      this.error = 'Error connecting to the service';
      this.isLoading = false;
      console.error(err);
    }
  }
} 