import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionNotificationService, SessionNotification } from '../../services/session-notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-session-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="notification" 
         [class]="getNotificationClass()"
         class="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ease-in-out">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg *ngIf="notification.type === 'warning'" class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <svg *ngIf="notification.type === 'success'" class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium">{{ notification.message }}</p>
        </div>
        <div class="ml-auto pl-3">
          <button (click)="closeNotification()" class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none">
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-enter {
      opacity: 0;
      transform: translateX(100%);
    }
    .notification-enter-active {
      opacity: 1;
      transform: translateX(0);
    }
    .notification-leave-active {
      opacity: 0;
      transform: translateX(100%);
    }
  `]
})
export class SessionNotificationComponent implements OnInit, OnDestroy {
  notification: SessionNotification | null = null;
  private subscription?: Subscription;

  constructor(private sessionNotificationService: SessionNotificationService) {}

  ngOnInit(): void {
    this.subscription = this.sessionNotificationService.notification$.subscribe(
      notification => {
        this.notification = notification;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getNotificationClass(): string {
    if (!this.notification) return '';
    
    switch (this.notification.type) {
      case 'warning':
        return 'bg-yellow-50 border border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border border-green-200 text-green-800';
      default:
        return 'bg-blue-50 border border-blue-200 text-blue-800';
    }
  }

  closeNotification(): void {
    this.sessionNotificationService.hideNotification();
  }
} 