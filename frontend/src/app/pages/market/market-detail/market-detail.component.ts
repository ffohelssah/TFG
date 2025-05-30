import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketService } from '../../../services/market.service';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';
import { Market } from '../../../models/market';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-market-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-4">
      <div *ngIf="loading" class="text-center py-10">
        <p class="text-gray-600">Loading listing details...</p>
      </div>

      <div *ngIf="error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <p class="text-red-700">{{ error }}</p>
      </div>

      <div *ngIf="!loading && !error && listing" class="bg-transparent rounded-lg shadow-lg overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <!-- Card Image -->
          <div class="relative">
            <img 
              [src]="getImageUrl(listing.Card?.imageUrl)" 
              [alt]="listing.Card?.name"
              class="w-full h-auto object-contain rounded-lg">
          </div>

          <!-- Card Details -->
          <div class="space-y-6">
            <div>
              <h1 class="text-3xl font-bold text-black dark:text-white">{{ listing.Card?.name }}</h1>
              <div class="mt-2 flex items-center space-x-4">
                <span class="text-lg font-semibold text-green-600">{{ listing.price | currency }}</span>
                <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {{ listing.status }}
                </span>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Edition</h3>
                <p class="mt-1 text-black dark:text-white">{{ listing.Card?.edition }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Condition</h3>
                <p class="mt-1 text-black dark:text-white">{{ listing.Card?.condition }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Seller</h3>
                <p class="mt-1 text-black dark:text-white">{{ listing.seller?.username }}</p>
              </div>

              <div *ngIf="listing.description">
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                <p class="mt-1 text-black dark:text-white">{{ listing.description }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Listed At</h3>
                <p class="mt-1 text-black dark:text-white">{{ listing.listedAt | date:'medium' }}</p>
              </div>
            </div>

            <div class="pt-6">
              <button 
                *ngIf="listing.status === 'available' && currentUser && currentUser.id !== listing.seller?.id"
                (click)="startChat()"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
              >
                Contact Seller
              </button>
              <button 
                *ngIf="listing.status !== 'available'"
                disabled
                class="w-full bg-gray-400 text-white px-6 py-3 rounded-md font-medium opacity-50 cursor-not-allowed"
              >
                Not Available
              </button>
              <button 
                *ngIf="!currentUser"
                (click)="navigateToLogin()"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
              >
                Login to Contact Seller
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class MarketDetailComponent implements OnInit {
  listing: Market | null = null;
  loading = true;
  error: string | null = null;
  private baseApiUrl = environment.apiUrl.replace('/api', '');
  currentUser: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private marketService: MarketService,
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadListing(id);
      }
    });
  }

  private loadListing(id: number): void {
    this.loading = true;
    this.error = null;

    this.marketService.getListingById(id).subscribe({
      next: (listing) => {
        this.listing = listing;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading listing:', error);
        this.error = 'Error loading listing details. Please try again later.';
        this.loading = false;
      }
    });
  }

  getImageUrl(imageUrl?: string): string {
    if (!imageUrl) return 'assets/img/card-placeholder.jpg';
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    return `${environment.apiUrl.replace('/api', '')}${imageUrl}`;
  }

  startChat(): void {
    if (!this.listing || !this.currentUser || !this.listing.id || !this.listing.seller?.id) {
      this.error = 'Cannot start chat: Missing required information';
      return;
    }

    this.chatService.createChat(this.listing.id, this.listing.seller.id).subscribe({
      next: (response) => {
        if (response.chat && response.chat.id) {
          this.router.navigate(['/chat', response.chat.id]);
        } else {
          console.error('Invalid chat response:', response);
          this.error = 'Error starting conversation: Invalid response from server';
        }
      },
      error: (error) => {
        console.error('Error creating chat:', error);
        this.error = 'Error starting conversation. Please try again later.';
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
  }
} 