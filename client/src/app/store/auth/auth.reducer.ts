import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { User } from '../../models/user.model';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.signup, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.signupSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null,
  })),
  on(AuthActions.signupFailure, (state, { error }) => ({
    ...state,
    user: null,
    loading: false,
    error,
  })),
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    user: null,
    loading: false,
    error,
  })),
  on(AuthActions.getUserDetails, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.getUserDetailsSuccess, (state, { user }) => ({
    ...state,
    user: user,
    loading: false,
    error: null,
  })),
  on(AuthActions.getUserDetailsFailure, (state, { error }) => ({
    ...state,
    user: null,
    loading: false,
    error,
  })),
  on(AuthActions.logout, (state) => ({
    ...state,
  })),
  on(AuthActions.logoutSuccess, (state) => ({
    ...state,
    user: null,
    loading: false,
    error: null,
  })),
  on(AuthActions.initSession, AuthActions.signup, AuthActions.login, AuthActions.loginWithGoogle, AuthActions.loginWithGitHub, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  // --- Successful Authentication ---
  // When a session is initialized or a login/signup succeeds, store the user.
  on(AuthActions.initSessionSuccess, AuthActions.signupSuccess, AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
  })),
  on(AuthActions.initSessionFailure, (state) => ({
    ...initialAuthState
  })),
);
