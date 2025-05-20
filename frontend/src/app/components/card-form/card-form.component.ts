import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Card } from '../../models/card';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-card-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">{{ editMode ? 'Editar Carta' : 'Añadir Nueva Carta' }}</h2>
          <button (click)="onCancel()" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form [formGroup]="cardForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Columna izquierda - Datos básicos -->
            <div>
              <div class="mb-4">
                <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nombre de la Carta</label>
                <input 
                  type="text" 
                  id="name"
                  formControlName="name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ej. Black Lotus"
                >
                <div *ngIf="cardForm.get('name')?.invalid && cardForm.get('name')?.touched" class="text-red-500 text-sm mt-1">
                  El nombre de la carta es obligatorio
                </div>
              </div>
              
              <div class="mb-4">
                <label for="edition" class="block text-sm font-medium text-gray-700 mb-1">Edición</label>
                <input 
                  type="text" 
                  id="edition"
                  formControlName="edition"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ej. Alpha"
                >
                <div *ngIf="cardForm.get('edition')?.invalid && cardForm.get('edition')?.touched" class="text-red-500 text-sm mt-1">
                  La edición es obligatoria
                </div>
              </div>
              
              <div class="mb-4">
                <label for="condition" class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select 
                  id="condition"
                  formControlName="condition"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Selecciona un estado</option>
                  <option value="mint">Mint</option>
                  <option value="near mint">Near Mint</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="light played">Light Played</option>
                  <option value="played">Played</option>
                  <option value="poor">Poor</option>
                </select>
                <div *ngIf="cardForm.get('condition')?.invalid && cardForm.get('condition')?.touched" class="text-red-500 text-sm mt-1">
                  El estado es obligatorio
                </div>
              </div>
              
              <div class="mb-4">
                <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                <input 
                  type="number" 
                  id="price"
                  formControlName="price"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                >
              </div>
            </div>
            
            <!-- Columna derecha - Imagen y descripción -->
            <div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Imagen de la Carta</label>
                <div 
                  class="border-2 border-dashed border-gray-300 rounded-md p-6 relative"
                  [class.border-indigo-500]="isDragging"
                  (dragover)="onDragOver($event)"
                  (dragleave)="onDragLeave($event)"
                  (drop)="onDrop($event)"
                >
                  <div class="text-center">
                    <svg *ngIf="!imagePreview" xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    
                    <img *ngIf="imagePreview" [src]="imagePreview" alt="Vista previa" class="mx-auto max-h-48 rounded">
                    
                    <div *ngIf="!imagePreview" class="mt-2">
                      <p class="text-sm text-gray-500">
                        Arrastra y suelta una imagen aquí<br>o
                      </p>
                      <button 
                        type="button" 
                        class="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        (click)="fileInput.click()"
                      >
                        Seleccionar Archivo
                      </button>
                    </div>
                    <div *ngIf="imagePreview" class="mt-2">
                      <p class="text-sm text-gray-500">{{ imageName }}</p>
                      <button 
                        type="button" 
                        class="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        (click)="removeImage()"
                      >
                        Cambiar Imagen
                      </button>
                    </div>
                  </div>
                  <input 
                    #fileInput
                    type="file"
                    accept="image/*"
                    class="hidden"
                    (change)="onFileSelected($event)"
                  >
                </div>
                <div *ngIf="cardForm.get('image')?.invalid && cardForm.get('image')?.touched" class="text-red-500 text-sm mt-1">
                  La imagen es obligatoria
                </div>
              </div>
              
              <div class="mb-4">
                <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                <textarea 
                  id="description"
                  formControlName="description"
                  rows="5"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Descripción de la carta..."
                ></textarea>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button 
              type="button"
              (click)="onCancel()"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              [disabled]="cardForm.invalid"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {{ editMode ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class CardFormComponent implements OnInit {
  @Input() card: Card | null = null;
  @Input() editMode = false;
  @Output() save = new EventEmitter<{card: Card, imageFile: File | null}>();
  @Output() cancel = new EventEmitter<void>();
  
  cardForm: FormGroup;
  isDragging = false;
  imageFile: File | null = null;
  imagePreview: string | null = null;
  imageName = '';
  originalImageUrl: string | null = null;
  baseApiUrl = environment.apiUrl.replace('/api', '');
  
  constructor(private fb: FormBuilder) {
    this.cardForm = this.fb.group({
      name: ['', Validators.required],
      edition: ['', Validators.required],
      condition: ['', Validators.required],
      image: ['', this.editMode ? [] : Validators.required],
      description: [''],
      price: [0, Validators.min(0)],
      isListed: [false]
    });
  }
  
  ngOnInit(): void {
    if (this.card && this.editMode) {
      this.cardForm.patchValue({
        name: this.card.name,
        edition: this.card.edition,
        condition: this.card.condition,
        description: this.card.description || '',
        price: this.card.price || 0,
        isListed: this.card.isListed || false
      });
      
      // Si hay una imagen existente, mostrarla como vista previa
      if (this.card.imageUrl) {
        // Guardar la URL original para enviarla al backend
        this.originalImageUrl = this.card.imageUrl;
        
        // La URL ya viene con la URL base desde el componente parent
        this.imagePreview = this.card.imageUrl;
        this.imageName = 'Imagen actual';
        this.cardForm.get('image')?.setValue('existing');
      }
    }
  }
  
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }
  
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }
  
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }
  
  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    const files = element.files;
    
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }
  
  processFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }
    
    this.imageFile = file;
    this.imageName = file.name;
    this.cardForm.get('image')?.setValue(file.name);
    this.originalImageUrl = null;
    
    // Mostrar la vista previa de la imagen
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  
  removeImage(): void {
    this.imageFile = null;
    this.imagePreview = null;
    this.imageName = '';
    this.originalImageUrl = null;
    this.cardForm.get('image')?.setValue('');
  }
  
  onSubmit(): void {
    if (this.cardForm.valid) {
      // Obtener los valores del formulario y eliminar el campo 'image'
      const formValues = { ...this.cardForm.value };
      delete formValues.image;
      
      // Crear el objeto cardData
      const cardData: Card = {
        ...formValues,
        userId: 0 // Este valor será establecido por el backend
      };
      
      if (this.editMode && this.card?.id) {
        cardData.id = this.card.id;
        
        // Si no se cambió la imagen y hay una URL original, extraer la parte relativa
        if (!this.imageFile && this.originalImageUrl) {
          // Si la URL contiene la base API, extraer solo la parte relativa
          if (this.originalImageUrl.startsWith(this.baseApiUrl)) {
            cardData.imageUrl = this.originalImageUrl.replace(this.baseApiUrl, '');
          } else {
            cardData.imageUrl = this.originalImageUrl;
          }
        }
      }
      
      this.save.emit({card: cardData, imageFile: this.imageFile});
    }
  }
  
  onCancel(): void {
    this.cancel.emit();
  }
} 