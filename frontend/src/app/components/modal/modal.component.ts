import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ModalService, ModalData } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngFor="let modal of modals" 
         class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
         [attr.data-modal-id]="modal.id"
         (click)="onBackdropClick($event, modal)">
      
      <div class="relative modal-bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <!-- Icon based on type -->
            <div [ngSwitch]="modal.type" class="mr-3">
              <svg *ngSwitchCase="'success'" class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              
              <svg *ngSwitchCase="'error'" class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              
              <svg *ngSwitchCase="'warning'" class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              
              <svg *ngSwitchCase="'confirm'" class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              
              <svg *ngSwitchCase="'info'" class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            
            <h3 class="text-lg font-semibold modal-text-black">{{ modal.title }}</h3>
          </div>
          
          <!-- Close button for non-confirm modals -->
          <button *ngIf="modal.type !== 'confirm'" 
                  (click)="closeModal(modal.id)"
                  class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Message -->
        <div class="mb-6">
          <p class="modal-text-black whitespace-pre-wrap">{{ modal.message }}</p>
        </div>
        
        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <!-- For confirmation modals -->
          <ng-container *ngIf="modal.type === 'confirm'">
            <button (click)="modal.onCancel?.()"
                    class="px-4 py-2 text-sm font-medium modal-text-black bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">
              {{ modal.cancelText || 'Cancel' }}
            </button>
            <button (click)="modal.onConfirm?.()"
                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {{ modal.confirmText || 'Confirm' }}
            </button>
          </ng-container>
          
          <!-- For other modals -->
          <button *ngIf="modal.type !== 'confirm'"
                  (click)="closeModal(modal.id)"
                  [ngClass]="{
                    'bg-green-600 hover:bg-green-700 focus:ring-green-500': modal.type === 'success',
                    'bg-red-600 hover:bg-red-700 focus:ring-red-500': modal.type === 'error',
                    'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500': modal.type === 'warning',
                    'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500': modal.type === 'info'
                  }"
                  class="px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2">
            OK
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Ensure modal appears above everything */
    :host {
      position: relative;
      z-index: 1000;
    }
    
    /* Force black text regardless of dark/light mode */
    .modal-text-black {
      color: #111827 !important;
    }
    
    .modal-text-black * {
      color: #111827 !important;
    }
    
    /* Ensure white background */
    .modal-bg-white {
      background-color: white !important;
    }
    
    /* Force styles for dark mode */
    :host ::ng-deep .dark .modal-text-black {
      color: #111827 !important;
    }
    
    :host ::ng-deep .dark .modal-text-black * {
      color: #111827 !important;
    }
    
    :host ::ng-deep .dark .modal-bg-white {
      background-color: white !important;
    }
    
    /* Animation */
    .fixed {
      animation: fadeIn 0.2s ease-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    .relative {
      animation: slideIn 0.2s ease-out;
    }
    
    @keyframes slideIn {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `]
})
export class ModalComponent implements OnInit, OnDestroy {
  modals: ModalData[] = [];
  private subscription?: Subscription;

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.subscription = this.modalService.modals$.subscribe(modals => {
      this.modals = modals;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  closeModal(id: string): void {
    this.modalService.closeModal(id);
  }

  onBackdropClick(event: Event, modal: ModalData): void {
    // Only close non-confirm modals when clicking backdrop
    if (modal.type !== 'confirm') {
      this.closeModal(modal.id);
    }
  }
} 