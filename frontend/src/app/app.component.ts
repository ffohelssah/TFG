import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/layout/header/header.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Magic Cards';
  
  constructor(private themeService: ThemeService) {}
  
  ngOnInit() {
    // Ensure the theme is properly initialized
    // ThemeService constructor should handle the initialization,
    // but this guarantees it runs after Angular is fully initialized
    const isDarkMode = this.themeService.isDarkMode();
    console.log('App component initialized with dark mode:', isDarkMode);
  }
}
