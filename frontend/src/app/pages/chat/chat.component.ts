import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { ChatService } from '@services/chat.service';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';
import { Chat } from '@models/chat';
import { User } from '@models/user';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-900">Messages</h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Lista de chats -->
        <div class="lg:col-span-1 bg-white dark:bg-white rounded-lg shadow overflow-hidden chat-bg-white">
          <div class="p-4 border-b">
            <h2 class="font-semibold chat-text-black">Conversations</h2>
          </div>
          
          <div *ngIf="loading" class="p-4 text-center">
            <p class="text-gray-600 dark:text-gray-600">Loading conversations...</p>
          </div>

          <div *ngIf="error" class="p-4">
            <p class="text-red-600 dark:text-red-600">{{ error }}</p>
          </div>
          
          <div *ngIf="!loading && !error">
            <div *ngIf="chats.length === 0" class="p-4 text-center">
              <p class="text-gray-900 dark:text-gray-900">You don't have any active conversations.</p>
              <p class="mt-3">
                <a routerLink="/market" class="text-blue-600 dark:text-blue-600 hover:text-blue-800 dark:hover:text-blue-800">Explore Market</a>
              </p>
            </div>

            <div *ngIf="chats.length > 0" class="divide-y">
              <div *ngFor="let chat of chats" 
                   (click)="navigateToChat(chat.id!)"
                   class="p-4 hover:bg-gray-50 dark:hover:bg-gray-50 cursor-pointer relative">
                <div class="flex items-center space-x-3">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-900 truncate">
                      {{ getCardName(chat) }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 truncate">
                      With {{ getOtherUser(chat)?.username }}
                    </p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="text-xs text-gray-500 dark:text-gray-500">
                      {{ chat.lastActivity || chat.updatedAt | date:'short' }}
                    </div>
                    @if ((unreadChatIds$ | async)?.has(chat.id!)) {
                      <span class="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        !
                      </span>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Área de chat -->
        <div class="lg:col-span-2 bg-white dark:bg-white rounded-lg shadow overflow-hidden flex flex-col chat-bg-white">
          <div class="p-4 border-b">
            <h2 class="font-semibold chat-text-black">Select a conversation</h2>
          </div>
          
          <div class="flex-grow p-4 flex items-center justify-center">
            <div class="text-center">
              <p class="chat-text-gray">Select a conversation from the list or start a new one from the market.</p>
            </div>
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
export class ChatComponent implements OnInit, OnDestroy {
  chats: Chat[] = [];
  loading = true;
  error: string | null = null;
  currentUser: User | null = null;
  unreadChatIds$: Observable<Set<number>>;
  private routerSubscription?: Subscription;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.unreadChatIds$ = this.notificationService.unreadChatIds$;
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
    });

    this.loadChats();
    
    // Recargar chats cada vez que se visita la página para reflejar cambios
    this.refreshChatsOnFocus();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private refreshChatsOnFocus(): void {
    // Escuchar cuando la ventana recupera el foco para recargar chats
    window.addEventListener('focus', () => {
      this.loadChats();
    });
    
    // También recargar cuando se navega a esta página
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/chat') {
          this.loadChats();
        }
      });
  }

  private loadChats(): void {
    this.loading = true;
    this.error = null;

    // Primero limpiar chats huérfanos, luego cargar la lista
    this.chatService.cleanupOrphanedChats().subscribe({
      next: (cleanupResult) => {
        if (cleanupResult.deletedCount > 0) {
          console.log(`Cleaned up ${cleanupResult.deletedCount} orphaned chats`);
        }
        // Ahora cargar la lista de chats
        this.loadChatsFromServer();
      },
      error: (error) => {
        console.error('Error cleaning up chats:', error);
        // Continuar cargando chats aunque falle la limpieza
        this.loadChatsFromServer();
      }
    });
  }

  private loadChatsFromServer(): void {
    this.chatService.getUserChats().subscribe({
      next: (chats: Chat[]) => {
        this.chats = chats;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading chats:', error);
        this.error = 'Error loading conversations. Please try again later.';
        this.loading = false;
      }
    });
  }

  getOtherUser(chat: Chat): User | null {
    if (!this.currentUser) return null;
    const otherUser = chat.userId1 === this.currentUser.id ? chat.user2 : chat.user1;
    return otherUser || null;
  }

  getCardName(chat: Chat): string {
    // Intentar diferentes formas de acceder al nombre de la carta
    // Primero con Market (mayúscula) que es como viene del backend
    const cardName = chat.Market?.Card?.name || 
                     chat.market?.Card?.name || 
                     chat.market?.card?.name || 
                     (chat as any).Market?.Card?.name ||
                     'Unnamed card';
    return cardName;
  }

  navigateToChat(chatId: number): void {
    this.router.navigate(['/chat', chatId]);
  }

  hasChatUnreadMessages(chatId: number): Observable<boolean> {
    return this.notificationService.hasChatUnreadMessages(chatId);
  }
} 