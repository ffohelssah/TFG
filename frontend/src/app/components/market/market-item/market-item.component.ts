import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Market } from '../../../models/market';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-market-item',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './market-item.component.html',
  styleUrls: ['./market-item.component.scss']
})
export class MarketItemComponent {
  @Input() listing!: Market;
  private baseApiUrl = environment.apiUrl.replace('/api', '');

  getImageUrl(imageUrl?: string): string {
    if (!imageUrl) return 'assets/img/card-placeholder.jpg';
    
    // Si la URL ya es absoluta, devolverla como está
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Sino, añadir la URL base del backend
    return `${this.baseApiUrl}${imageUrl}`;
  }
}