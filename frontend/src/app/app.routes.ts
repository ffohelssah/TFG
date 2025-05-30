// ================================================================================================
// CONFIGURACIÓN DE RUTAS - APP ROUTES
// ================================================================================================
// Este archivo define todas las rutas de la aplicación Angular.
// Incluye rutas públicas, protegidas por autenticación y manejo de rutas no encontradas.
// 
// TIPOS DE RUTAS:
// - Públicas: Home, Login, Register, Market (listado y detalle)
// - Protegidas: My Cards, Chat, Profile (requieren authGuard)
// - Wildcard: Redirección para rutas no encontradas
// 
// CARACTERÍSTICAS:
// - Guard de autenticación para rutas privadas
// - Parámetros dinámicos para detalles (:id)
// - Lazy loading preparado para optimización futura
// ================================================================================================

// ============================================================================================
// IMPORTACIONES
// ============================================================================================
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { MyCardsComponent } from './pages/my-cards/my-cards.component';
import { MarketComponent } from './pages/market/market.component';
import { ChatComponent } from './pages/chat/chat.component';
import { ChatDetailComponent } from './pages/chat/chat-detail/chat-detail.component';
import { MarketDetailComponent } from './pages/market/market-detail/market-detail.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { authGuard } from './guards/auth.guard';

// ============================================================================================
// CONFIGURACIÓN DE RUTAS
// ============================================================================================
// Definición de todas las rutas con sus componentes y guards correspondientes
export const routes: Routes = [
  // ========================================================================================
  // RUTA PRINCIPAL
  // ========================================================================================
  { path: '', component: HomeComponent },
  
  // ========================================================================================
  // RUTAS DE AUTENTICACIÓN (PÚBLICAS)
  // ========================================================================================
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // ========================================================================================
  // RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN)
  // ========================================================================================
  { path: 'my-cards', component: MyCardsComponent, canActivate: [authGuard] },
  { path: 'chat', component: ChatComponent, canActivate: [authGuard] },
  { path: 'chat/:id', component: ChatDetailComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  
  // ========================================================================================
  // RUTAS DEL MARKETPLACE (PÚBLICAS)
  // ========================================================================================
  { path: 'market', component: MarketComponent },
  { path: 'market/:id', component: MarketDetailComponent },
  
  // ========================================================================================
  // MANEJO DE RUTAS NO ENCONTRADAS
  // ========================================================================================
  { path: '**', redirectTo: '' }
];
