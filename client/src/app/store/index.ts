import { ActionReducerMap } from '@ngrx/store';
import { AuthState } from './auth/auth.state';
import { authReducer } from './auth/auth.reducer';

/**
 * The root state for the entire application.
 * As your application grows, you will add more feature states here.
 */
export interface AppState {
  auth: AuthState;
  // ... other feature states
}

/**
 * A map of all the reducers in the application.
 * The keys here will be the keys of the state slices in the store.
 */
export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  // ... other feature reducers
};
