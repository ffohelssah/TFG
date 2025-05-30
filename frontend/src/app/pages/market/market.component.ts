import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarketService } from '../../services/market.service';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Market } from '../../models/market';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Card Market</h1>
      
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4 fixed-text-color">Filters</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1 fixed-text-color">Search</label>
            <input 
              type="text" 
              [(ngModel)]="searchTerm"
              class="w-full px-3 py-2 border border-gray-300 rounded-md" 
              placeholder="Card name..."
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1 fixed-text-color">Edition</label>
            <select [(ngModel)]="filterEdition" class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="">All editions</option>
              <option *ngFor="let edition of editions" [value]="edition">{{ edition }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1 fixed-text-color">Price</label>
            <div class="flex items-center gap-2">
              <input 
                type="number" 
                [(ngModel)]="minPrice"
                class="w-full px-3 py-2 border border-gray-300 rounded-md" 
                placeholder="Min"
              >
              <span class="fixed-text-color">-</span>
              <input 
                type="number" 
                [(ngModel)]="maxPrice"
                class="w-full px-3 py-2 border border-gray-300 rounded-md" 
                placeholder="Max"
              >
            </div>
          </div>
        </div>
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mt-4" (click)="applyFilters()">Apply filters</button>
      </div>
      
      <div *ngIf="listings.length === 0 && !loading; else listingGrid" class="text-center py-10">
        <p class="fixed-text-color">There are no listings available at the moment.</p>
        <p class="mt-4">
          <a routerLink="/my-cards" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Sell your cards</a>
        </p>
      </div>
      
      <ng-template #listingGrid>
        <div *ngIf="loading" class="text-center py-10">
          <p class="fixed-text-color">Loading listings...</p>
        </div>
        
        <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let listing of filteredListings" class="bg-white rounded-lg shadow overflow-hidden">
            <div class="relative" style="padding-top: 140%;">
              <!-- Image with error handling -->
              <ng-container *ngIf="listing.Card?.imageUrl; else noImage">
                <img 
                  [src]="getImageUrl(listing.Card?.imageUrl)" 
                  [alt]="listing.Card?.name || 'Card Image'" 
                  class="absolute inset-0 h-full w-full object-contain"
                >
              </ng-container>
              
              <!-- Template for when there is no image -->
              <ng-template #noImage>
                <div class="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <span class="text-gray-500 fixed-text-color">Sin imagen</span>
                </div>
              </ng-template>
            </div>
            <div class="p-4">
              <h3 class="text-lg font-semibold fixed-text-color">{{ listing.Card?.name || "No name" }}</h3>
              <div class="flex gap-2 items-center mt-1">
                <span class="text-sm text-gray-600 fixed-text-color">{{ listing.Card?.edition || "No edition" }}</span>
                <span class="text-sm bg-gray-200 px-2 py-1 rounded fixed-text-color">{{ listing.Card?.condition || "No condition" }}</span>
              </div>
              <div class="flex justify-between items-center mt-3">
                <span class="text-sm font-semibold text-green-600">{{ listing.price | currency }}</span>
                <span class="text-sm text-gray-500 fixed-text-color">Seller: {{ listing.seller?.username }}</span>
              </div>
              <div class="mt-4 flex justify-end space-x-2">
                <button 
                  *ngIf="listing.status === 'available' && currentUser && currentUser.id !== listing.seller?.id"
                  (click)="contactSeller(listing)"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Buy
                </button>
                <button 
                  *ngIf="listing.status !== 'available'"
                  disabled
                  class="bg-gray-400 text-white px-4 py-2 rounded-md text-sm opacity-50 cursor-not-allowed"
                >
                  Not Available
                </button>
                <button 
                  *ngIf="!currentUser"
                  (click)="navigateToLogin()"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Login to Buy
                </button>
                <button 
                  *ngIf="currentUser && currentUser.id === listing.seller?.id"
                  disabled
                  class="bg-gray-400 text-white px-4 py-2 rounded-md text-sm opacity-50 cursor-not-allowed"
                >
                  Your Card
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div *ngIf="pagination && pagination.totalPages > 1" class="mt-6 flex justify-center">
          <div class="flex space-x-2">
            <button 
              [disabled]="pagination.page === 1"
              (click)="changePage(pagination.page - 1)"
              class="px-3 py-1 rounded border"
              [class.opacity-50]="pagination.page === 1"
            >
              Anterior
            </button>
            <span class="px-3 py-1 fixed-text-color">
              Página {{ pagination.page }} de {{ pagination.totalPages }}
            </span>
            <button 
              [disabled]="pagination.page === pagination.totalPages"
              (click)="changePage(pagination.page + 1)"
              class="px-3 py-1 rounded border"
              [class.opacity-50]="pagination.page === pagination.totalPages"
            >
              Siguiente
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MarketComponent implements OnInit {
  listings: Market[] = [];
  filteredListings: Market[] = [];
  editions: string[] = [];
  loading = true;
  baseApiUrl = environment.apiUrl.replace('/api', '');
  currentUser: any = null;
  
  // Filtros
  searchTerm = '';
  filterEdition = '';
  minPrice?: number;
  maxPrice?: number;
  
  // Paginación
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null = null;
  
  constructor(
    private marketService: MarketService,
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.loadListings();
  }
  
  loadListings(page: number = 1): void {
    this.loading = true;
    this.marketService.getListings({ page, limit: 9 }).subscribe({
      next: (response: any) => {
        if (response && response.listings) {
          this.listings = response.listings;
          this.filteredListings = [...this.listings];
          this.pagination = response.pagination;
          this.extractEditions();
          
          // Debug log to see the structure of the first listing
          if (this.listings.length > 0) {
            console.log('First listing structure:', this.listings[0]);
          }
        } else {
          this.listings = [];
          this.filteredListings = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading listings', error);
        this.loading = false;
      }
    });
  }
  
  getImageUrl(imageUrl?: string): string {
    if (!imageUrl) return '';
    
    // Si la URL ya es absoluta, devolverla como está
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Sino, añadir la URL base del backend
    return `${this.baseApiUrl}${imageUrl}`;
  }
  
  extractEditions(): void {
    const editionsSet = new Set<string>();
    this.listings.forEach(listing => {
      if (listing.Card && listing.Card.edition) {
        editionsSet.add(listing.Card.edition);
      }
    });
    this.editions = Array.from(editionsSet);
  }
  
  applyFilters(): void {
    let filtered = [...this.listings];
    
    // Aplicar filtro de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(listing => 
        listing.Card?.name?.toLowerCase().includes(term) || 
        listing.Card?.edition?.toLowerCase().includes(term)
      );
    }
    
    // Aplicar filtro de edición
    if (this.filterEdition) {
      filtered = filtered.filter(listing => listing.Card?.edition === this.filterEdition);
    }
    
    // Aplicar filtro de precio mínimo
    if (this.minPrice !== undefined && this.minPrice > 0) {
      filtered = filtered.filter(listing => listing.price >= this.minPrice!);
    }
    
    // Aplicar filtro de precio máximo
    if (this.maxPrice !== undefined && this.maxPrice > 0) {
      filtered = filtered.filter(listing => listing.price <= this.maxPrice!);
    }
    
    this.filteredListings = filtered;
  }
  
  changePage(page: number): void {
    if (page < 1 || (this.pagination && page > this.pagination.totalPages)) {
      return;
    }
    this.loadListings(page);
  }

  contactSeller(listing: Market): void {
    if (!listing || !this.currentUser || !listing.id || !listing.seller?.id) {
      console.error('Cannot start chat: Missing required information');
      return;
    }

    this.chatService.createChat(listing.id, listing.seller.id).subscribe({
      next: (response) => {
        if (response.chat && response.chat.id) {
          this.router.navigate(['/chat', response.chat.id]);
        } else {
          console.error('Invalid chat response:', response);
          alert('Error starting conversation: Invalid response from server');
        }
      },
      error: (error) => {
        console.error('Error creating chat:', error);
        alert('Error starting conversation. Please try again later.');
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
  }
} 