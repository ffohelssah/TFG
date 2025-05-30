import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradeService, Trade } from '../../../services/trade.service';
import { AuthService } from '../../../services/auth.service';
import { ModalService } from '../../../services/modal.service';
import { User } from '../../../models/user';
import { Chat } from '../../../models/chat';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-trade-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="trade" class="border-t border-gray-200 bg-blue-50 p-4 mt-4 trade-bg-white">
      <!-- Card Info -->
      <div class="flex items-center space-x-3 mb-4">
        <img 
          [src]="getCardImageUrl(trade.Market?.Card?.imageUrl)" 
          [alt]="trade.Market?.Card?.name"
          class="w-12 h-12 object-cover rounded"
        >
        <div>
          <h4 class="font-semibold trade-text-black">{{ trade.Market?.Card?.name }}</h4>
          <p class="text-sm trade-text-gray">{{ trade.price | currency }} • {{ trade.Market?.Card?.condition }}</p>
        </div>
      </div>

      <!-- Trade Status -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium trade-text-black">Trade Status:</span>
          <span [class]="getStatusClass(trade.status)" class="px-2 py-1 rounded-full text-xs font-medium">
            {{ getStatusText(trade.status) }}
          </span>
        </div>
        
        <!-- Progress indicators -->
        <div class="flex items-center space-x-2 mb-3">
          <div class="flex items-center space-x-1">
            <div [class]="trade.buyerAccepted ? 'bg-green-500' : 'bg-gray-300'" class="w-3 h-3 rounded-full"></div>
            <span class="text-xs trade-text-black" [class]="trade.buyerAccepted ? 'text-green-600' : ''">
              {{ getBuyerName() }}
            </span>
          </div>
          <div class="flex-1 h-px bg-gray-300"></div>
          <div class="flex items-center space-x-1">
            <div [class]="trade.sellerAccepted ? 'bg-green-500' : 'bg-gray-300'" class="w-3 h-3 rounded-full"></div>
            <span class="text-xs trade-text-black" [class]="trade.sellerAccepted ? 'text-green-600' : ''">
              {{ getSellerName() }}
            </span>
          </div>
        </div>

        <!-- Status Message -->
        <p class="text-sm trade-text-gray mb-3">{{ getStatusMessage() }}</p>
      </div>

      <!-- Action Buttons -->
      <div *ngIf="trade.status !== 'completed' && trade.status !== 'rejected'" class="flex space-x-2">
        <button 
          *ngIf="canAccept()"
          (click)="acceptTrade()"
          [disabled]="isLoading"
          class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {{ isLoading ? 'Processing...' : 'Accept Trade' }}
        </button>
        
        <button 
          (click)="rejectTrade()"
          [disabled]="isLoading"
          class="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {{ isLoading ? 'Processing...' : 'Reject Trade' }}
        </button>
      </div>

      <!-- Trade completed message -->
      <div *ngIf="trade.status === 'completed'" class="text-center py-2">
        <p class="text-green-600 font-medium">🎉 Trade completed successfully!</p>
        <p class="text-sm trade-text-gray">The card has been transferred. This conversation will be deleted.</p>
      </div>

      <!-- Trade rejected message -->
      <div *ngIf="trade.status === 'rejected'" class="text-center py-2">
        <p class="text-red-600 font-medium">❌ Trade was rejected</p>
        <p class="text-sm trade-text-gray">This conversation has been deleted.</p>
      </div>
    </div>

    <!-- Initiate Trade Button (when no trade exists) -->
    <div *ngIf="!trade && !hideInitiateButton" class="border-t border-gray-200 bg-gray-50 p-4 mt-4 trade-bg-white">
      <button 
        (click)="initiateTrade()"
        [disabled]="isLoading || !canInitiateTrade()"
        class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        {{ isLoading ? 'Starting Trade...' : 'Start Trade' }}
      </button>
      <p class="text-xs trade-text-gray mt-2 text-center">
        Click to start the trade process for this card
      </p>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    /* Force black text in trade controls */
    .trade-text-black {
      color: #111827 !important;
    }
    
    .trade-text-black * {
      color: #111827 !important;
    }
    
    .trade-text-gray {
      color: #4B5563 !important;
    }
    
    .trade-text-gray * {
      color: #4B5563 !important;
    }
    
    .trade-bg-white {
      background-color: white !important;
    }
    
    /* Force styles for dark mode */
    :host ::ng-deep .dark .trade-text-black {
      color: #111827 !important;
    }
    
    :host ::ng-deep .dark .trade-text-black * {
      color: #111827 !important;
    }
    
    :host ::ng-deep .dark .trade-text-gray {
      color: #4B5563 !important;
    }
    
    :host ::ng-deep .dark .trade-text-gray * {
      color: #4B5563 !important;
    }
    
    :host ::ng-deep .dark .trade-bg-white {
      background-color: white !important;
    }
  `]
})
export class TradeControlsComponent implements OnInit, OnDestroy {
  @Input() chatId!: number;
  @Input() chat: Chat | null = null;
  @Input() hideInitiateButton = false;
  @Output() tradeUpdated = new EventEmitter<Trade | null>();
  @Output() tradeCompleted = new EventEmitter<void>();

  trade: Trade | null = null;
  currentUser: User | null = null;
  isLoading = false;
  private subscription = new Subscription();
  private pollSubscription?: Subscription;

  constructor(
    private tradeService: TradeService,
    private authService: AuthService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );

    this.loadTrade();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
  }

  private startPolling(): void {
    // Poll every 5 seconds for trade updates (less frequent)
    this.pollSubscription = interval(5000).subscribe(() => {
      // Only poll if the trade is still active and we're not loading
      if (!this.isLoading && this.trade && 
          this.trade.status !== 'completed' && 
          this.trade.status !== 'rejected') {
        this.loadTrade();
      }
    });
  }

  loadTrade(): void {
    if (!this.chatId || this.isLoading) return;

    this.tradeService.getChatTrade(this.chatId).subscribe({
      next: (response) => {
        const previousStatus = this.trade?.status;
        this.trade = response.trade;
        this.tradeUpdated.emit(this.trade);
        
        // Stop polling immediately when trade is finished
        if (this.trade?.status === 'completed' || this.trade?.status === 'rejected') {
          if (this.pollSubscription) {
            this.pollSubscription.unsubscribe();
          }
          
          // Only emit tradeCompleted if the status just changed to avoid duplicate events
          if (previousStatus !== this.trade.status) {
            this.tradeCompleted.emit();
          }
        }
      },
      error: (error) => {
        console.error('Error loading trade:', error);
        // Stop polling on error to prevent infinite loops
        if (this.pollSubscription) {
          this.pollSubscription.unsubscribe();
        }
      }
    });
  }

  initiateTrade(): void {
    if (!this.chatId || this.isLoading) return;

    this.isLoading = true;
    this.tradeService.initiateTrade(this.chatId).subscribe({
      next: (response) => {
        this.trade = response.trade;
        this.tradeUpdated.emit(this.trade);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error initiating trade:', error);
        this.isLoading = false;
        
        // Show error message
        let errorMessage = 'Error starting trade. Please try again.';
        if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.modalService.showError(errorMessage);
      }
    });
  }

  acceptTrade(): void {
    if (!this.trade || this.isLoading) return;

    this.isLoading = true;
    this.tradeService.acceptTrade(this.trade.id).subscribe({
      next: (response) => {
        this.trade = response.trade;
        this.tradeUpdated.emit(this.trade);
        this.isLoading = false;
        
        // If trade is completed, stop polling immediately
        if (this.trade?.status === 'completed') {
          if (this.pollSubscription) {
            this.pollSubscription.unsubscribe();
          }
        }
      },
      error: (error) => {
        console.error('Error accepting trade:', error);
        this.isLoading = false;
        this.modalService.showError('Error accepting trade. Please try again.');
      }
    });
  }

  async rejectTrade(): Promise<void> {
    if (!this.trade || this.isLoading) return;

    const confirmed = await this.modalService.showConfirm(
      'Are you sure you want to reject this trade? This action cannot be undone and will delete the conversation.',
      'Confirm Rejection',
      'Reject Trade',
      'Cancel'
    );
    
    if (!confirmed) return;

    this.isLoading = true;
    
    // Stop polling immediately to prevent conflicts
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
    
    this.tradeService.rejectTrade(this.trade.id).subscribe({
      next: (response) => {
        this.trade = response.trade;
        this.tradeUpdated.emit(this.trade);
        this.isLoading = false;
        
        // Show success message
        this.modalService.showSuccess('Trade rejected successfully. The conversation will be deleted.');
        
        // El chat será eliminado, emitir evento para redirigir
        this.tradeCompleted.emit();
      },
      error: (error) => {
        console.error('Error rejecting trade:', error);
        this.isLoading = false;
        this.modalService.showError('Error rejecting trade. Please try again.');
        
        // Restart polling if rejection failed
        this.startPolling();
      }
    });
  }

  canAccept(): boolean {
    if (!this.trade || !this.currentUser) return false;
    
    const isBuyer = this.trade.buyerId === this.currentUser.id;
    const isSeller = this.trade.sellerId === this.currentUser.id;
    
    return (isBuyer && !this.trade.buyerAccepted) || (isSeller && !this.trade.sellerAccepted);
  }

  canInitiateTrade(): boolean {
    if (!this.currentUser || !this.chat) return false;
    
    // Verificar que el usuario actual no sea el seller
    const sellerId = this.chat.Market?.seller?.id || this.chat.market?.seller?.id || this.chat.Market?.sellerId || this.chat.market?.sellerId;
    
    if (sellerId && this.currentUser.id === sellerId) {
      return false; // El seller no puede iniciar un trade
    }
    
    return true;
  }

  getBuyerName(): string {
    return this.trade?.buyer?.username || 'Buyer';
  }

  getSellerName(): string {
    return this.trade?.seller?.username || 'Seller';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'buyer_accepted':
      case 'seller_accepted':
        return 'bg-blue-100 text-blue-800';
      case 'both_accepted':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'buyer_accepted':
        return 'Buyer Accepted';
      case 'seller_accepted':
        return 'Seller Accepted';
      case 'both_accepted':
        return 'Both Accepted';
      case 'completed':
        return 'Completed';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  }

  getStatusMessage(): string {
    if (!this.trade || !this.currentUser) return '';

    const isBuyer = this.trade.buyerId === this.currentUser.id;
    const isSeller = this.trade.sellerId === this.currentUser.id;

    switch (this.trade.status) {
      case 'pending':
        return 'Trade initiated. Both parties need to accept to complete the transaction.';
      case 'buyer_accepted':
        if (isBuyer) return 'You accepted the trade. Waiting for seller to accept.';
        if (isSeller) return 'Buyer accepted the trade. Please review and accept if you agree.';
        return 'Buyer accepted. Waiting for seller.';
      case 'seller_accepted':
        if (isSeller) return 'You accepted the trade. Waiting for buyer to accept.';
        if (isBuyer) return 'Seller accepted the trade. Please review and accept if you agree.';
        return 'Seller accepted. Waiting for buyer.';
      case 'both_accepted':
        return 'Both parties accepted! Trade will be completed automatically.';
      case 'completed':
        return 'Trade completed successfully. The card has been transferred and this conversation will be deleted.';
      case 'rejected':
        return 'Trade was rejected. This conversation has been deleted.';
      default:
        return '';
    }
  }

  getCardImageUrl(imageUrl?: string): string {
    if (!imageUrl) return 'https://via.placeholder.com/48x48?text=Card';
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    return `http://localhost:3000${imageUrl}`;
  }
}