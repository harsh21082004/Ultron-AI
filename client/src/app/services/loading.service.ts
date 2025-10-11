import { Injectable, signal, NgZone } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private _progress = signal(0);
  public readonly progress = this._progress.asReadonly();
  
  private _isLoading = signal(false);
  public readonly isLoading = this._isLoading.asReadonly();
  
  private intervalId: any = null;

  constructor(private router: Router, private zone: NgZone) {
    this.router.events.pipe(
      filter(
        (event): event is NavigationStart | NavigationEnd | NavigationCancel | NavigationError =>
          event instanceof NavigationStart ||
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
      )
    ).subscribe(event => {
      if (event instanceof NavigationStart) {
        // When navigation starts:
        // 1. Set loading to true and progress to 40.
        this._isLoading.set(true);
        this._progress.set(40);
        
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }

        // 2. Start a new interval to smoothly increase the progress.
        this.zone.runOutsideAngular(() => {
          this.intervalId = setInterval(() => {
            this.zone.run(() => {
              this._progress.update(value => {
                if (value >= 99) {
                  clearInterval(this.intervalId);
                  return value;
                }
                return value + 1;
              });
            });
          }, 80); // Adjust this value to make the progress faster or slower
        });

      } else {
        // When navigation finishes for any reason:
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
        
        // Set the progress to 100 to show completion.
        this._progress.set(100);
        
        // After a short delay, reset progress and the loading state to hide the bar.
        setTimeout(() => {
          this._isLoading.set(false);
        }, 500); // Wait 0.5s before hiding
      }
    });
  }
}

