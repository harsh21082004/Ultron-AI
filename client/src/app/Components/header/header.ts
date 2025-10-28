import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar'; // 1. Import the progress bar module
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { Store } from '@ngrx/store';
import { AppState } from '../../store';
import { PinkButton } from "../pink-button/pink-button";
import { RouterLink } from '@angular/router';

import { ThemeService } from '../../services/theme.services';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatSlideToggleModule, 
    MatMenuModule, 
    MatButtonModule, 
    MatProgressBarModule, // 2. Add the module to the imports array
    MatIconModule, 
    PinkButton, 
    RouterLink,
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class HeaderComponent {
  light_mode = 'light_mode';
  dark_mode = 'bedtime';

  user$ : Observable<User | null>;

  private loadingService = inject(LoadingService);
  isLoading = this.loadingService.isLoading; 

  // Inject the service to use it in the template
  constructor(public themeService: ThemeService, private store: Store<AppState>) {
    this.user$ = this.store.select(state => state.auth.user);
  }
  // A computed signal to easily check if the current mode is dark
  isDarkMode = computed(() => this.themeService.currentTheme() === 'dark');
}

