import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideHttpClient } from '@angular/common/http';

import { authReducer } from './store/auth/auth.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { chatReducer } from './store/chat/chat.reducer';
import { ChatEffects } from './store/chat/chat.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideZonelessChangeDetection(),
    
    // Correctly provide the root store with all reducers
    provideStore({
      auth: authReducer,
      chat: chatReducer
    }),
    
    // Provide all effects
    provideEffects([
      AuthEffects,
      ChatEffects
    ]),
  ]
};