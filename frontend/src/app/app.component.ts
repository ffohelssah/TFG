import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/layout/header/header.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { SessionNotificationComponent } from './components/session-notification/session-notification.component';
import { ThemeService } from './services/theme.service';
import { ChatService } from './services/chat.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, SessionNotificationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [ChatService]
})
export class AppComponent implements OnInit {
  title = 'Magic Cards';
  
  constructor(
    private themeService: ThemeService,
    private authService: AuthService
  ) {}
  
  ngOnInit() {
    // Ensure the theme is properly initialized
    // ThemeService constructor should handle the initialization,
    // but this guarantees it runs after Angular is fully initialized
    const isDarkMode = this.themeService.isDarkMode();
  }
}
