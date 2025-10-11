import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, exhaustMap, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';

@Injectable()
export class AuthEffects {
  // Use inject() to get dependencies right away
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginWithGoogle$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.loginWithGoogle),
      tap(() => this.authService.loginWithGoogle())
    );
  }, { dispatch: false });

  loginWithGitHub$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.loginWithGitHub),
      tap(() => this.authService.loginWithGitHub())
    );
  }, { dispatch: false });


  // --- SESSION AND CREDENTIAL-BASED AUTH EFFECTS ---
  initSession$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.initSession),
      exhaustMap(() =>
        this.authService.getUserDetails(localStorage.getItem('token') || '').pipe(
          map(user => AuthActions.initSessionSuccess({ user })),
          catchError(() => of(AuthActions.initSessionFailure()))
        )
      )
    );
  });


  // Effects can now be defined as class properties and safely use the injected services
  signup$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.signup),
      tap(action => console.log('AuthEffect: Caught signup action', action)),
      exhaustMap(action =>
        this.authService.signup({ name: action.name, email: action.email, password: action.password }).pipe(
          map(user => AuthActions.signupSuccess({ user })),
          catchError(error => of(AuthActions.signupFailure({ error: error.error?.message || 'An unknown error occurred' })))
        )
      )
    );
  });

  login$ = createEffect(() => {
  return this.actions$.pipe(
    ofType(AuthActions.login),
    exhaustMap(action =>
      this.authService.login({ email: action.email, password: action.password }).pipe(
        map(response => {
          // ✅ FIX: Combine the user object and the token from the response
          const userWithToken: User = {
            ...response.user,    // Spread all properties from the nested user object
            token: response.token // Add the token property from the top level
          };
          // Dispatch the success action with the complete user object
          return AuthActions.loginSuccess({ user: userWithToken });
        }),
        catchError(error => of(AuthActions.loginFailure({ error: error.message || 'Login failed' })))
      )
    )
  );
});

  logout$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.logout),
      exhaustMap(() =>
        of(null).pipe(
          tap(() => {
            // 1. Perform all side effects here.
            localStorage.removeItem('token');
            //reload page
            this.router.navigate(['/']);
            console.log('AuthEffect: Side effects complete. Token removed, navigated to login.');
          }),
          // 2. After the side effects are done, transform the stream
          //    into the success action. This is what will be dispatched.
          map(() => AuthActions.logoutSuccess())
        )
      )
    );
  });

  getUserDetails$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.getUserDetails),
      exhaustMap(() => {
        const token = localStorage.getItem('token');
        if (!token) {
          return of(AuthActions.getUserDetailsFailure({ error: 'Token not found' }));
        }
        return this.authService.getUserDetails(token).pipe(

          // ✅ ADD THIS LINE TO DEBUG
          tap(response => console.log('API Response from Get User Details:', response)),

          map(response => AuthActions.getUserDetailsSuccess({ user: response })), // Changed to 'response' for clarity
          catchError(error => of(AuthActions.getUserDetailsFailure({ error: error.message || 'Failed to fetch user details' })))
        );
      })
    );
  });

  authSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.signupSuccess, AuthActions.loginSuccess),
      tap(({ user }) => {
        console.log('AuthEffect: Auth success, navigating and setting token.');
        localStorage.setItem('token', user.token);
        this.router.navigate(['/']);
      })
    );
  }, { dispatch: false });

  // No constructor needed for DI anymore, but it can be kept for other logic if needed.
  constructor() { }
}
