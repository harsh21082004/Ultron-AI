import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from './store/auth/auth.actions';
import { filter, Observable } from 'rxjs';
import { selectIsAuthenticated } from './store/auth/auth.selectors';
import { ThemeService } from './services/theme.services';
import { LoadingService } from './services/loading.service';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Sidebar } from "./Components/sidebar/sidebar";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule, // Required for the @if block
    MatProgressBarModule,
    Sidebar,
  ],
  // The template now includes the progress bar at the top level, outside the router outlet.
  template: `
    <!-- The progress bar is fixed to the top of the viewport -->
    @if (isLoading) {
     <div class="progress fixed top-0 left-0 w-full z-50">
      <mat-progress-bar 
        mode="determinate" 
        [value]="progress()" 
        color="primary">
      </mat-progress-bar>
      </div>
    }
    <div class="flex h-screen w-screen">
      <!-- The sidebar is part of the root layout -->
       @if(!isLoginOrSignupPage()){
      <app-sidebar></app-sidebar>
       }
      
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class App implements OnInit {
  selectIsAuthenticated$: Observable<boolean>;


  // Inject the LoadingService and get its progress signal
  private loadingService = inject(LoadingService);
  progress = this.loadingService.progress;
  isLoading = this.loadingService.isLoading();
  isLoginOrSignupPage = signal(false);

  constructor(
    private router: Router,
    private store: Store,
    private themeService: ThemeService,
  ) {
    this.selectIsAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Check the URL after the navigation is complete.
      const isLoginPage = event.urlAfterRedirects === '/login';
      const isSignupPage = event.urlAfterRedirects === '/signup';
      this.isLoginOrSignupPage.set(isLoginPage || isSignupPage);
    });
  }

  ngOnInit(): void {
    // Initialize the theme when the app loads
    this.themeService.loadTheme();

    // Dispatch the action to check for an existing session
    this.store.dispatch(AuthActions.initSession());

    // Your existing logic to redirect already authenticated users
    this.selectIsAuthenticated$.subscribe(isAuth => {
      if (isAuth && (this.router.url === '/signup' || this.router.url === '/login')) {
        this.router.navigate(['/']);
      }
    });
  }
}
