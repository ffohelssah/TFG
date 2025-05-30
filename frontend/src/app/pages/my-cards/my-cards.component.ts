import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardService } from '../../services/card.service';
import { MarketService } from '../../services/market.service'; 
import { Card } from '../../models/card';
import { CardFormComponent } from '../../components/card-form/card-form.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-my-cards',
  standalone: true,
  imports: [CommonModule, FormsModule, CardFormComponent],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">My Cards</h1>
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md" (click)="showAddCardForm()">Add Card</button>
      </div>
      
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1 fixed-text-color">Search</label>
            <input type="text" [(ngModel)]="searchTerm" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Card name...">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1 fixed-text-color">Edition</label>
            <select [(ngModel)]="filterEdition" class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="">All editions</option>
              <option *ngFor="let edition of editions" [value]="edition">{{ edition }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1 fixed-text-color">Grade</label>
            <select [(ngModel)]="filterListed" class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="">All grades</option>
              <option value="true">Listed</option>
              <option value="false">Not listed</option>
            </select>
          </div>
        </div>
      </div>
      
      <div *ngIf="cards.length === 0 && !loading; else cardList" class="text-center py-10">
        <p class="fixed-text-color">You don't have any cards in your collection.</p>
        <p class="mt-4">
          <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md" (click)="showAddCardForm()">Add first card</button>
        </p>
      </div>
      
      <ng-template #cardList>
        <div *ngIf="loading" class="text-center py-10">
          <p class="fixed-text-color">Loading cards...</p>
        </div>
        
        <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let card of filteredCards" class="bg-white rounded-lg shadow overflow-hidden">
            <div class="relative" style="padding-top: 140%;">
              <img [src]="getImageUrl(card.imageUrl)" [alt]="card.name" class="absolute inset-0 h-full w-full object-contain">
            </div>
            <div class="p-4">
              <h3 class="text-lg font-semibold fixed-text-color">{{ card.name }}</h3>
              <p class="text-sm text-gray-600 fixed-text-color">{{ card.edition }}</p>
              <div class="flex justify-between items-center mt-2">
                <span class="text-sm bg-gray-200 px-2 py-1 rounded fixed-text-color">{{ card.condition }}</span>
                <span *ngIf="card.isListed" class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded fixed-text-color">Listed</span>
                <span *ngIf="!card.isListed" class="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded fixed-text-color">Not listed</span>
              </div>
              <div class="mt-4 flex flex-col space-y-3">
                <!-- Precio si está listada -->
                <div *ngIf="card.isListed" class="flex items-center">
                  <span class="text-lg font-semibold text-green-600">{{ card.price | currency }}</span>
                </div>
                
                <!-- Botones de acción -->
                <div class="flex flex-wrap gap-2 justify-start">
                  <!-- Botón para listar en mercado (solo si no está listada) -->
                  <button *ngIf="!card.isListed" 
                    class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                    (click)="showSellCardForm(card)"
                  >
                    List on Market
                  </button>
                  
                  <!-- Botón para remover del mercado (solo si está listada) -->
                  <button *ngIf="card.isListed" 
                    class="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                    (click)="removeFromMarket(card)">
                    Remove from Market
                  </button>
                  
                  <!-- Botón de editar -->
                  <button 
                    class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                    (click)="editCard(card)">
                    Edit
                  </button>
                  
                  <!-- Botón de eliminar -->
                  <button 
                    class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                    (click)="deleteCard(card.id!)">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-template>
    </div>
    
    <app-card-form 
      *ngIf="showForm" 
      [card]="selectedCard" 
      [editMode]="editMode" 
      (save)="saveCard($event)" 
      (cancel)="hideForm()">
    </app-card-form>

    <!-- Modal to sell card -->
    <div *ngIf="showSellForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Sell Card</h2>
          <button (click)="hideSellForm()" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div *ngIf="sellCard" class="mb-4">
          <div class="flex items-center space-x-4 mb-4">
            <img [src]="getImageUrl(sellCard.imageUrl)" alt="Card Image" class="w-20 h-28 object-contain">
            <div>
              <h3 class="text-lg font-semibold fixed-text-color">{{ sellCard.name }}</h3>
              <p class="text-sm text-gray-600 fixed-text-color">{{ sellCard.edition }}</p>
              <p class="text-sm text-gray-600 fixed-text-color">{{ sellCard.condition }}</p>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1 fixed-text-color">Price</label>
            <input 
              type="number" 
              [(ngModel)]="sellPrice" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="0.00"
              step="0.01"
              min="0"
            >
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1 fixed-text-color">Description (optional)</label>
            <textarea 
              [(ngModel)]="sellDescription" 
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Description for buyers..."
            ></textarea>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            type="button"
            (click)="hideSellForm()"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="button"
            [disabled]="!sellPrice || sellPrice <= 0"
            (click)="listCardForSale()"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            List on Market
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class MyCardsComponent implements OnInit {
  cards: Card[] = [];
  filteredCards: Card[] = [];
  editions: string[] = [];
  loading = true;
  showForm = false;
  editMode = false;
  selectedCard: Card | null = null;
  baseApiUrl = environment.apiUrl.replace('/api', '');
  
  // Para vender cartas
  showSellForm = false;
  sellCard: Card | null = null;
  sellPrice: number = 0;
  sellDescription: string = '';
  
  // Filtros
  searchTerm = '';
  filterEdition = '';
  filterListed = '';
  
  constructor(
    private cardService: CardService,
    private marketService: MarketService
  ) {}
  
  ngOnInit(): void {
    this.loadCards();
  }
  
  loadCards(): void {
    this.loading = true;
    this.cardService.getUserCards().subscribe({
      next: (cards) => {
        this.cards = cards;
        this.filteredCards = [...cards];
        this.extractEditions();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cards', error);
        this.loading = false;
      }
    });
  }
  
  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    
    // Si la URL ya es absoluta, devolverla como está
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Sino, añadir la URL base del backend
    return `${this.baseApiUrl}${imageUrl}`;
  }
  
  extractEditions(): void {
    const editionsSet = new Set<string>();
    this.cards.forEach(card => editionsSet.add(card.edition));
    this.editions = Array.from(editionsSet);
  }
  
  applyFilters(): void {
    let filtered = [...this.cards];
    
    // Aplicar filtro de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(card => 
        card.name.toLowerCase().includes(term) || 
        card.edition.toLowerCase().includes(term)
      );
    }
    
    // Aplicar filtro de edición
    if (this.filterEdition) {
      filtered = filtered.filter(card => card.edition === this.filterEdition);
    }
    
    // Aplicar filtro de listado
    if (this.filterListed !== '') {
      const isListed = this.filterListed === 'true';
      filtered = filtered.filter(card => card.isListed === isListed);
    }
    
    this.filteredCards = filtered;
  }
  
  showAddCardForm(): void {
    this.editMode = false;
    this.selectedCard = null;
    this.showForm = true;
  }
  
  editCard(card: Card): void {
    // Crear una copia de la carta con la URL de imagen correcta para la vista previa
    const cardCopy = { ...card };
    if (card.imageUrl && !card.imageUrl.startsWith('http')) {
      cardCopy.imageUrl = this.getImageUrl(card.imageUrl);
    }
    
    this.editMode = true;
    this.selectedCard = cardCopy;
    this.showForm = true;
  }
  
  hideForm(): void {
    this.showForm = false;
  }
  
  showSellCardForm(card: Card): void {
    this.sellCard = { ...card };
    this.sellPrice = card.price || 0;
    this.sellDescription = card.description || '';
    this.showSellForm = true;
  }
  
  hideSellForm(): void {
    this.showSellForm = false;
    this.sellCard = null;
    this.sellPrice = 0;
    this.sellDescription = '';
  }
  
  listCardForSale(): void {
    if (!this.sellCard || !this.sellCard.id || this.sellPrice <= 0) {
      return;
    }
    
    // Primero actualizar la carta para marcarla como listada
    const updatedCard: Card = {
      ...this.sellCard,
      isListed: true,
      price: this.sellPrice,
      description: this.sellDescription
    };
    
    const formData = new FormData();
    
    // Añadir todos los campos de la carta al FormData
    Object.keys(updatedCard).forEach(key => {
      if (updatedCard[key as keyof Card] !== undefined) {
        formData.append(key, updatedCard[key as keyof Card]?.toString() || '');
      }
    });
    
    this.cardService.updateCard(this.sellCard.id, formData).subscribe({
      next: (card) => {
        // Ahora crear un listado en el mercado
        this.marketService.listCard({
          cardId: card.id!,
          price: this.sellPrice,
          description: this.sellDescription
        }).subscribe({
          next: () => {
            // Actualizar la lista de cartas
            const index = this.cards.findIndex(c => c.id === card.id);
            if (index !== -1) {
              this.cards[index] = card;
              this.applyFilters();
            }
            this.hideSellForm();
          },
          error: (error) => {
            console.error('Error listing card on market', error);
            alert('Ha ocurrido un error al listar la carta en el mercado. Por favor, inténtalo de nuevo.');
          }
        });
      },
      error: (error) => {
        console.error('Error updating card', error);
        alert('Ha ocurrido un error al actualizar la carta. Por favor, inténtalo de nuevo.');
      }
    });
  }
  
  saveCard(data: {card: Card, imageFile: File | null}): void {
    const { card, imageFile } = data;
    
    // Crear FormData para enviar datos y archivo
    const formData = new FormData();
    
    // Añadir todos los campos de la carta al FormData
    Object.keys(card).forEach(key => {
      if (card[key as keyof Card] !== undefined) {
        formData.append(key, card[key as keyof Card]?.toString() || '');
      }
    });
    
    // Añadir el archivo de imagen si existe
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    if (this.editMode && card.id) {
      this.cardService.updateCard(card.id, formData).subscribe({
        next: (updatedCard) => {
          const index = this.cards.findIndex(c => c.id === updatedCard.id);
          if (index !== -1) {
            this.cards[index] = updatedCard;
            this.applyFilters();
          }
          this.hideForm();
        },
        error: (error) => {
          console.error('Error updating card', error);
          alert('Ha ocurrido un error al actualizar la carta. Por favor, inténtalo de nuevo.');
        }
      });
    } else {
      this.cardService.createCard(formData).subscribe({
        next: (newCard) => {
          this.cards.push(newCard);
          this.extractEditions();
          this.applyFilters();
          this.hideForm();
        },
        error: (error) => {
          console.error('Error creating card', error);
          alert('Ha ocurrido un error al crear la carta. Por favor, inténtalo de nuevo.');
        }
      });
    }
  }
  
  deleteCard(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta carta?')) {
      this.cardService.deleteCard(id).subscribe({
        next: () => {
          this.cards = this.cards.filter(card => card.id !== id);
          this.extractEditions();
          this.applyFilters();
        },
        error: (error) => console.error('Error deleting card', error)
      });
    }
  }

  removeFromMarket(card: Card): void {
    if (confirm('¿Estás seguro de que quieres remover esta carta del mercado?')) {
      this.marketService.unlistCard(card.id!).subscribe({
        next: () => {
          // Recargar las cartas para obtener el estado actualizado
          this.loadCards();
        },
        error: (error: any) => {
          console.error('Error removing card from market', error);
          alert('Ha ocurrido un error al remover la carta del mercado. Por favor, inténtalo de nuevo.');
        }
      });
    }
  }
} 