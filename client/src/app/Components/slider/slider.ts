import { Component, computed } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ThemeService } from '../../services/theme.services';

@Component({
  selector: 'app-slider',
  imports: [MatSlideToggleModule],
  templateUrl: './slider.html',
  styleUrl: './slider.scss'
})
export class Slider {
  constructor(public themeService: ThemeService) {}

  isDarkMode = computed(() => this.themeService.currentTheme() === 'dark');

}
