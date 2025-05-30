import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChatService } from '@services/chat.service';
import { SocketService } from '@services/socket.service';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';
import { TradeControlsComponent } from '../../../components/trade/trade-controls/trade-controls.component';
import { Trade } from '../../../services/trade.service';
import { Chat } from '@models/chat';
import { Message } from '@models/message';
import { User } from '@models/user';

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, TradeControlsComponent],
  template: `
    <div class="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <!-- Redirecting Overlay -->
      <div *ngIf="redirecting" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-700">Redirecting to chat list...</p>
        </div>
      </div>

      <div *ngIf="loading" class="flex items-center justify-center h-full">
        <p class="text-gray-600 dark:text-gray-600">Loading chat...</p>
      </div>

      <div *ngIf="error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <p class="text-red-700 dark:text-red-700">{{ error }}</p>
      </div>

      <div *ngIf="!loading && !error && chat" class="h-full flex flex-col bg-white dark:bg-white rounded-lg shadow-lg chat-bg-white">
        <!-- Chat Header -->
        <div class="p-4 border-b bg-gray-50 dark:bg-gray-50 flex items-center">
          <button (click)="goBack()" class="mr-4 text-gray-600 dark:text-gray-600 hover:text-gray-800 dark:hover:text-gray-800">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="flex-1">
            <h2 class="text-lg font-semibold chat-text-black">{{ getCardName() }}</h2>
            <p class="text-sm chat-text-gray">Con {{ getOtherUser()?.username }}</p>
          </div>
          <!-- Trade Status Indicator -->
          <div *ngIf="currentTrade" class="flex items-center space-x-2">
            <span [class]="getTradeStatusClass()" class="px-2 py-1 rounded-full text-xs font-medium">
              {{ getTradeStatusText() }}
            </span>
          </div>
        </div>

        <!-- Chat Closed Message -->
        <div *ngIf="chat && !chat.isActive" class="bg-red-50 border-b border-red-200 p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
            <span class="text-red-700">This conversation has been closed.</span>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4" #messageContainer>
          <div *ngIf="messages.length === 0" class="text-center text-gray-500 dark:text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
          
          <div *ngFor="let message of messages" 
               [ngClass]="{'flex justify-end': message.senderId === currentUser?.id}">
            <div [ngClass]="{
              'max-w-[70%] rounded-lg p-3': true,
              'bg-blue-100 text-gray-800': message.senderId === currentUser?.id,
              'bg-gray-100 text-gray-800': message.senderId !== currentUser?.id
            }">
              <p class="chat-text-black">{{ message.content }}</p>
              <span class="text-xs chat-text-gray mt-1 block">
                {{ message.sentAt || message.createdAt | date:'shortTime' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Trade Controls -->
        <app-trade-controls 
          *ngIf="chat && chat.isActive"
          [chatId]="chat.id!"
          [chat]="chat"
          (tradeUpdated)="onTradeUpdated($event)"
          (tradeCompleted)="onTradeCompleted()"
        ></app-trade-controls>

        <!-- Message Input -->
        <div *ngIf="chat && chat.isActive" class="p-4 border-t bg-gray-50 dark:bg-gray-50">
          <form (ngSubmit)="sendMessage()" class="flex space-x-2">
            <input 
              type="text" 
              [(ngModel)]="newMessage" 
              name="message"
              placeholder="Type a message..."
              class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-gray-900 bg-white dark:bg-white"
            >
            <button 
              type="submit"
              [disabled]="!newMessage.trim()"
              class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>

        <!-- Chat Closed Input -->
        <div *ngIf="chat && !chat.isActive" class="p-4 border-t bg-gray-100">
          <div class="text-center text-gray-500">
            <p>This conversation is closed. No new messages can be sent.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-text-black {
      color: #111827 !important;
    }
    .chat-text-black * {
      color: #111827 !important;
    }
    .chat-text-gray {
      color: #4B5563 !important;
    }
    .chat-text-gray * {
      color: #4B5563 !important;
    }
    .chat-bg-white {
      background-color: white !important;
    }
    
    /* Forzar estilos específicos para modo oscuro */
    :host ::ng-deep .dark .chat-text-black {
      color: #111827 !important;
    }
    :host ::ng-deep .dark .chat-text-gray {
      color: #4B5563 !important;
    }
    :host ::ng-deep .dark .chat-bg-white {
      background-color: white !important;
    }
  `]
})
export class ChatDetailComponent implements OnInit, OnDestroy {
  chat: Chat | null = null;
  messages: Message[] = [];
  loading = true;
  error: string | null = null;
  newMessage = '';
  currentUser: User | null = null;
  currentTrade: Trade | null = null;
  redirecting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private socketService: SocketService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.route.params.subscribe(params => {
      const chatId = params['id'];
      if (chatId) {
        this.loadChat(chatId);
      }
    });
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

  private loadChat(chatId: number): void {
    this.loading = true;
    this.error = null;

    this.chatService.getChatMessages(chatId).subscribe({
      next: (response) => {
        this.messages = response.messages;
        this.chat = response.chat;
        this.loading = false;
        this.scrollToBottom();
        
        // Actualizar el conteo de notificaciones
        this.notificationService.updateUnreadCounts();
      },
      error: (error) => {
        console.error('Error loading chat:', error);
        this.error = 'Error loading chat. Please try again later.';
        this.loading = false;
      }
    });

    // Join socket room
    this.socketService.joinRoom(chatId.toString());
    this.socketService.receiveMessage().subscribe(message => {
      if (message.chatId === chatId) {
        this.messages.push(message);
        this.scrollToBottom();
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.chat) return;

    this.chatService.sendMessage(this.chat.id!, this.newMessage).subscribe({
      next: (response) => {
        const message = response.message || response;
        this.messages.push(message);
        this.newMessage = '';
        this.scrollToBottom();
        
        // Actualizar el conteo de notificaciones
        this.notificationService.updateUnreadCounts();
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.error = 'Error sending message. Please try again.';
      }
    });
  }

  getOtherUser(): User | null {
    if (!this.chat || !this.currentUser) return null;
    const otherUser = this.chat.userId1 === this.currentUser.id ? this.chat.user2 : this.chat.user1;
    return otherUser || null;
  }

  getCardName(): string {
    if (!this.chat) return 'Carta sin nombre';
    
    // Intentar diferentes formas de acceder al nombre de la carta
    // Primero con Market (mayúscula) que es como viene del backend
    const cardName = this.chat.Market?.Card?.name || 
                     this.chat.market?.Card?.name || 
                     this.chat.market?.card?.name || 
                     (this.chat as any).Market?.Card?.name ||
                     'Carta sin nombre';
    return cardName;
  }

  goBack(): void {
    this.router.navigate(['/chat']);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.overflow-y-auto');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }

  onTradeUpdated(trade: Trade | null): void {
    this.currentTrade = trade;
    
    // Si el trade fue rechazado, el chat será eliminado
    if (trade?.status === 'rejected') {
      this.handleChatDeleted('Trade was rejected. The conversation has been deleted.');
    }
  }

  onTradeCompleted(): void {
    // Cuando el trade se completa o rechaza, el chat es eliminado
    this.handleChatDeleted('');
  }

  private handleChatDeleted(message: string): void {
    this.redirecting = true;
    
    // Mostrar mensaje si se proporciona
    if (message) {
      alert(message);
    } else {
      alert('Trade completed successfully! The card has been transferred. Redirecting...');
    }
    
    // Redirigir a la lista de chats después de un breve delay
    setTimeout(() => {
      this.router.navigate(['/chat']);
    }, 1000);
  }

  getTradeStatusClass(): string {
    if (!this.currentTrade) return '';
    
    switch (this.currentTrade.status) {
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

  getTradeStatusText(): string {
    if (!this.currentTrade) return '';
    
    switch (this.currentTrade.status) {
      case 'pending':
        return '⏳ Trade Pending';
      case 'buyer_accepted':
        return '🔄 Buyer Accepted';
      case 'seller_accepted':
        return '🔄 Seller Accepted';
      case 'both_accepted':
        return '✅ Both Accepted';
      case 'completed':
        return '🎉 Completed';
      case 'rejected':
        return '❌ Rejected';
      default:
        return '';
    }
  }
} 