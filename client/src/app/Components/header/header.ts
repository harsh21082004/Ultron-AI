import { Component, computed, inject } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; // Example using Angular Material
import { ThemeService } from '../../services/theme.services';
import { MatMenu, MatMenuModule } from "@angular/material/menu";
import { Slider } from "../slider/slider";
import { MatButtonModule } from '@angular/material/button';
import { LoadingService } from '../../services/loading.service';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { MatIcon } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { Store } from '@ngrx/store';
import { AppState } from '../../store';
import { PinkButton } from "../pink-button/pink-button";
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatSlideToggleModule, 
    MatMenuModule, 
    MatButtonModule, 
    MatProgressBarModule, 
    MatIcon, 
    PinkButton, 
    AsyncPipe, 
    RouterLink
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header {
  light_mode = 'light_mode';
  dark_mode = 'bedtime';

  user$ : Observable<User | null>;

  // Inject the service to use it in the template
  constructor(public themeService: ThemeService, private store: Store<AppState>) {
    this.user$ = this.store.select(state => state.auth.user);
  }
  // A computed signal to easily check if the current mode is dark
  isDarkMode = computed(() => this.themeService.currentTheme() === 'dark');
}