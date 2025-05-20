import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold mb-6">Mensajes</h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Lista de chats -->
        <div class="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
          <div class="p-4 border-b">
            <h2 class="font-semibold">Conversaciones</h2>
          </div>
          
          <div class="p-4 text-center">
            <p>No tienes conversaciones activas.</p>
            <p class="mt-3">
              <a routerLink="/market" class="btn btn-primary">Explorar Mercado</a>
            </p>
          </div>
        </div>
        
        <!-- Área de chat -->
        <div class="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden flex flex-col">
          <div class="p-4 border-b">
            <h2 class="font-semibold">Selecciona una conversación</h2>
          </div>
          
          <div class="flex-grow p-4 flex items-center justify-center">
            <div class="text-center">
              <p class="text-gray-500">Selecciona una conversación de la lista o inicia una nueva desde el mercado.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ChatComponent {

} 