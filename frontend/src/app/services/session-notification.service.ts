import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SessionNotification {
  message: string;
  type: 'warning' | 'info' | 'success';
  timeRemaining?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SessionNotificationService {
  private notificationSubject = new BehaviorSubject<SessionNotification | null>(null);
  public notification$ = this.notificationSubject.asObservable();

  constructor() { }

  showSessionWarning(timeRemaining: number) {
    const minutes = Math.floor(timeRemaining / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    let message: string;
    if (minutes > 0) {
      message = `Tu sesión expirará en ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else {
      message = `Tu sesión expirará en ${seconds} segundo${seconds > 1 ? 's' : ''}`;
    }

    this.notificationSubject.next({
      message,
      type: 'warning',
      timeRemaining
    });

    // Auto-hide after 10 seconds
    setTimeout(() => {
      this.hideNotification();
    }, 10000);
  }

  showSessionExtended() {
    this.notificationSubject.next({
      message: '¡Sesión extendida por 30 minutos más!',
      type: 'success'
    });

    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.hideNotification();
    }, 3000);
  }

  hideNotification() {
    this.notificationSubject.next(null);
  }
} 