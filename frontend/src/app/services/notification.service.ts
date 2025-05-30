import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatService } from './chat.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private unreadMessagesCount = new BehaviorSubject<number>(0);
  private unreadChatIds = new BehaviorSubject<Set<number>>(new Set());

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {
    // Inicializar cuando el usuario se loguee
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.updateUnreadCounts();
      } else {
        this.unreadMessagesCount.next(0);
        this.unreadChatIds.next(new Set());
      }
    });
  }

  get unreadMessagesCount$(): Observable<number> {
    return this.unreadMessagesCount.asObservable();
  }

  get unreadChatIds$(): Observable<Set<number>> {
    return this.unreadChatIds.asObservable();
  }

  updateUnreadCounts(): void {
    console.log('Updating unread counts...');
    this.chatService.getUnreadCounts().subscribe({
      next: (data: {totalUnread: number, unreadChatIds: number[]}) => {
        console.log('Unread counts received:', data);
        this.unreadMessagesCount.next(data.totalUnread);
        this.unreadChatIds.next(new Set(data.unreadChatIds));
        console.log('Current unread count:', data.totalUnread);
        console.log('Current unread chat IDs:', data.unreadChatIds);
      },
      error: (error: any) => {
        console.error('Error updating unread counts:', error);
      }
    });
  }

  markChatAsRead(chatId: number): void {
    this.chatService.markAsRead(chatId).subscribe({
      next: () => {
        this.updateUnreadCounts();
      },
      error: (error: any) => {
        console.error('Error marking chat as read:', error);
      }
    });
  }

  hasChatUnreadMessages(chatId: number): Observable<boolean> {
    return new Observable(observer => {
      this.unreadChatIds$.subscribe(unreadIds => {
        observer.next(unreadIds.has(chatId));
      });
    });
  }
} 