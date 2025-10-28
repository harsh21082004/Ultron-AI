import { Component, inject, OnInit, signal } from '@angular/core';
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
    CommonModule,
    MatProgressBarModule,
    Sidebar,
  ],
  template: `
    <!-- The progress bar is fixed to the top of the viewport -->
    <!-- It is only visible when isLoading() is true, as controlled by your LoadingService -->
    <!-- @if (isLoading()) {
      <mat-progress-bar 
        class="fixed top-0 left-0 w-full z-50"
        mode="indeterminate" 
        color="primary">
      </mat-progress-bar>
    } -->
    <div class="flex h-screen w-screen">
      <!-- The sidebar is conditionally displayed based on the current route -->
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

  // Inject the LoadingService and get its signal
  private loadingService = inject(LoadingService);
  isLoading = this.loadingService.isLoading; 
  isLoginOrSignupPage = signal(false);

  constructor(
    private router: Router,
    private store: Store,
    private themeService: ThemeService,
  ) {
    this.selectIsAuthenticated$ = this.store.select(selectIsAuthenticated);
    
    // Subscribe to router events to dynamically check the URL on every navigation
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const onAuthPage = event.urlAfterRedirects === '/login' || event.urlAfterRedirects === '/signup';
      this.isLoginOrSignupPage.set(onAuthPage);
    });
  }

  ngOnInit(): void {
    this.themeService.loadTheme();
    this.store.dispatch(AuthActions.initSession());

    this.selectIsAuthenticated$.subscribe(isAuth => {
      if (isAuth && (this.router.url === '/signup' || this.router.url === '/login')) {
        this.router.navigate(['/']);
      }
    });
  }
}

