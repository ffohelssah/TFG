// ================================================================================================
// SERVICIO DE MODALES - MODAL SERVICE
// ================================================================================================
// Este servicio centraliza la gestión de modales para toda la aplicación.
// Reemplaza los alerts/confirms nativos del navegador con modales elegantes y personalizables.
// 
// CARACTERÍSTICAS PRINCIPALES:
// - Sistema de stack de modales múltiples
// - Diferentes tipos: success, error, warning, info, confirm
// - Modales de confirmación con promesas
// - Gestión automática de IDs únicos
// - Observable para estado reactivo
// - Funciones async para confirmaciones
// 
// TIPOS DE MODALES:
// - success: Notificaciones de éxito
// - error: Mensajes de error
// - warning: Advertencias
// - info: Información general
// - confirm: Confirmaciones con botones de acción
// ================================================================================================

// ============================================================================================
// IMPORTACIONES
// ============================================================================================
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// ============================================================================================
// INTERFAZ DE DATOS DEL MODAL
// ============================================================================================
// Define la estructura de datos para cada modal
// Incluye callbacks para manejar confirmaciones y cancelaciones
export interface ModalData {
  id: string;                          // ID único del modal
  type: 'success' | 'error' | 'warning' | 'confirm' | 'info'; // Tipo de modal
  title: string;                       // Título del modal
  message: string;                     // Mensaje principal
  confirmText?: string;                // Texto del botón de confirmación
  cancelText?: string;                 // Texto del botón de cancelación
  onConfirm?: () => void;             // Callback de confirmación
  onCancel?: () => void;              // Callback de cancelación
}

// ============================================================================================
// CONFIGURACIÓN DEL SERVICIO
// ============================================================================================
// Injectable a nivel raíz, disponible en toda la aplicación
// Maneja estado global de modales con BehaviorSubject
@Injectable({
  providedIn: 'root'
})
export class ModalService {
  // Estado reactivo de la lista de modales activos
  private modalsSubject = new BehaviorSubject<ModalData[]>([]);
  public modals$ = this.modalsSubject.asObservable();

  constructor() { }

  // ============================================================================================
  // MÉTODOS PRIVADOS DE UTILIDAD
  // ============================================================================================

  // ========================================================================================
  // GENERADOR DE IDs ÚNICOS
  // ========================================================================================
  // Función: Crear identificador único para cada modal
  // Uso: Permite cerrar modales específicos en el stack
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // ========================================================================================
  // AGREGAR MODAL AL STACK
  // ========================================================================================
  // Función: Añadir nuevo modal a la lista de modales activos
  // Implementación: Inmutable usando spread operator
  private addModal(modal: ModalData): void {
    const currentModals = this.modalsSubject.value;
    this.modalsSubject.next([...currentModals, modal]);
  }

  // ============================================================================================
  // MÉTODOS PÚBLICOS DE MODALES
  // ============================================================================================

  // ========================================================================================
  // MODAL DE ÉXITO
  // ========================================================================================
  // Función: Mostrar notificación de éxito
  // Uso: Confirmaciones de acciones completadas exitosamente
  showSuccess(message: string, title: string = 'Success'): void {
    const modal: ModalData = {
      id: this.generateId(),
      type: 'success',
      title,
      message
    };
    this.addModal(modal);
  }

  // ========================================================================================
  // MODAL DE ERROR
  // ========================================================================================
  // Función: Mostrar mensaje de error
  // Uso: Notificar errores de validación o del servidor
  showError(message: string, title: string = 'Error'): void {
    const modal: ModalData = {
      id: this.generateId(),
      type: 'error',
      title,
      message
    };
    this.addModal(modal);
  }

  // ========================================================================================
  // MODAL DE ADVERTENCIA
  // ========================================================================================
  // Función: Mostrar advertencia al usuario
  // Uso: Alertar sobre posibles problemas o acciones irreversibles
  showWarning(message: string, title: string = 'Warning'): void {
    const modal: ModalData = {
      id: this.generateId(),
      type: 'warning',
      title,
      message
    };
    this.addModal(modal);
  }

  // ========================================================================================
  // MODAL DE INFORMACIÓN
  // ========================================================================================
  // Función: Mostrar información general
  // Uso: Mensajes informativos y guías para el usuario
  showInfo(message: string, title: string = 'Information'): void {
    const modal: ModalData = {
      id: this.generateId(),
      type: 'info',
      title,
      message
    };
    this.addModal(modal);
  }

  // ========================================================================================
  // MODAL DE CONFIRMACIÓN
  // ========================================================================================
  // Función: Mostrar modal de confirmación con promesa
  // Retorno: Promise<boolean> - true si confirma, false si cancela
  // Uso: Reemplazar window.confirm con modal elegante
  showConfirm(
    message: string, 
    title: string = 'Confirm',
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const modal: ModalData = {
        id: this.generateId(),
        type: 'confirm',
        title,
        message,
        confirmText,
        cancelText,
        onConfirm: () => {
          this.closeModal(modal.id);
          resolve(true);
        },
        onCancel: () => {
          this.closeModal(modal.id);
          resolve(false);
        }
      };
      this.addModal(modal);
    });
  }

  // ============================================================================================
  // MÉTODOS DE GESTIÓN DE MODALES
  // ============================================================================================

  // ========================================================================================
  // CERRAR MODAL ESPECÍFICO
  // ========================================================================================
  // Función: Cerrar modal por ID
  // Uso: Cerrar modal específico del stack sin afectar otros
  closeModal(id: string): void {
    const currentModals = this.modalsSubject.value;
    const filteredModals = currentModals.filter(modal => modal.id !== id);
    this.modalsSubject.next(filteredModals);
  }

  // ========================================================================================
  // CERRAR TODOS LOS MODALES
  // ========================================================================================
  // Función: Limpiar completamente el stack de modales
  // Uso: Reset general o limpieza en navegación
  closeAllModals(): void {
    this.modalsSubject.next([]);
  }

  // ========================================================================================
  // OBTENER MODALES ACTUALES
  // ========================================================================================
  // Función: Acceso directo al estado actual de modales
  // Uso: Verificar si hay modales activos
  get currentModals(): ModalData[] {
    return this.modalsSubject.value;
  }
} 