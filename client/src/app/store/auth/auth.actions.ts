import { createAction, props } from '@ngrx/store';
import { User } from '../../models/user.model';

// --- OAUTH ACTIONS ---
export const loginWithGoogle = createAction('[Auth] Login with Google');
export const loginWithGitHub = createAction('[Auth] Login with GitHub');

// --- SESSION INITIALIZATION ---
export const initSession = createAction('[Auth] Init Session');
export const initSessionSuccess = createAction(
  '[Auth] Init Session Success',
  props<{ user: User }>()
);
export const initSessionFailure = createAction('[Auth] Init Session Failure');


export const signup = createAction(
  '[Auth] Signup',
  props<{ name: string; email: string; password: string }>()
);

export const signupSuccess = createAction(
  '[Auth] Signup Success',
  props<{ user: User }>()
);

export const signupFailure = createAction(
  '[Auth] Signup Failure',
  props<{ error: string }>()
);

export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// --- LOGOUT ---
// This action starts the logout process.
export const logout = createAction('[Auth] Logout');

// This action is dispatched by the effect after logout is complete.
export const logoutSuccess = createAction('[Auth] Logout Success');


export const getUserDetails = createAction(
  '[Auth] Get User Details',
  props<{ token: string }>()
);


export const getUserDetailsSuccess = createAction(
  '[Auth] Get User Details Success',
  props<{ user: User }>()
);

export const getUserDetailsFailure = createAction(
  '[Auth] Get User Details Failure',
  props<{ error: string }>()
);