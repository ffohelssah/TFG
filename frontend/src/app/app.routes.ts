import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { MyCardsComponent } from './pages/my-cards/my-cards.component';
import { MarketComponent } from './pages/market/market.component';
import { ChatComponent } from './pages/chat/chat.component';
import { MarketDetailComponent } from './pages/market/market-detail/market-detail.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'my-cards', component: MyCardsComponent, canActivate: [authGuard] },
  { path: 'market', component: MarketComponent },
  { path: 'market/:id', component: MarketDetailComponent },
  { path: 'chat', component: ChatComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
