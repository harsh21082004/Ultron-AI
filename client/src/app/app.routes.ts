import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

// Import all page-level components
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/login/login.component';
import { SignupComponent } from './features/signup/signup.component';
import { ProfileComponent } from './features/profile/profile.component';
import { AuthCallbackComponent } from './features/auth-callback-component/auth-callback-component';
import { ChatComponent } from './shared/components/chat/chat.component';

export const routes: Routes = [
  // --- Unprotected Routes ---
  { 
    path: '', 
    component: HomeComponent,
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'signup', 
    component: SignupComponent
  },
  { 
    path: 'auth/callback', 
    component: AuthCallbackComponent 
  },

  // --- Protected Routes ---
  // These routes are now protected by the authGuard.
  { 
    path: 'chat', 
    component: ChatComponent,
  },
  { 
    path: 'chat/:id', 
    component: ChatComponent,
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [authGuard] 
  },

  // --- Fallback ---
  // Redirects any unknown URL back to the home page
  { 
    path: '**', 
    redirectTo: '' 
  }
];

