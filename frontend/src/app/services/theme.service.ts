import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = signal<boolean>(false);
  
  constructor() {
    // Check if the user has a preference saved in localStorage
    const savedTheme = localStorage.getItem('theme');
    
    console.log('Initial theme from localStorage:', savedTheme);
    
    if (savedTheme === 'dark') {
      this.darkMode.set(true);
      this.applyDarkMode(true);
      console.log('Applied dark theme from localStorage');
    } else if (!savedTheme) {
      // Check if user prefers dark mode in system settings
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      console.log('System prefers dark:', prefersDark);
      if (prefersDark) {
        this.darkMode.set(true);
        this.applyDarkMode(true);
        console.log('Applied dark theme from system preference');
      }
    }
    
    console.log('HTML has dark class:', document.documentElement.classList.contains('dark'));
    console.log('Body has dark class:', document.body.classList.contains('dark'));
  }

  isDarkMode() {
    return this.darkMode();
  }

  toggleTheme() {
    const newDarkMode = !this.darkMode();
    this.darkMode.set(newDarkMode);
    
    console.log('Toggling theme to:', newDarkMode ? 'dark' : 'light');
    this.applyDarkMode(newDarkMode);
    
    // Dispatch a custom event that components can listen for
    const themeChangedEvent = new CustomEvent('themeChanged', { 
      detail: { darkMode: newDarkMode } 
    });
    document.dispatchEvent(themeChangedEvent);
    
    console.log('After toggle - HTML has dark class:', document.documentElement.classList.contains('dark'));
    console.log('After toggle - Body has dark class:', document.body.classList.contains('dark'));
    console.log('Theme change event dispatched');
  }

  private applyDarkMode(isDark: boolean) {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
} 