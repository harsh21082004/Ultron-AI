import { Component, effect, ElementRef, HostListener, inject, ViewChild } from '@angular/core'; // Import HostListener
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { PinkButton } from "../pink-button/pink-button";
import { AppState } from '../../store';
import { User } from '../../models/user.model';
import * as AuthActions from '../../store/auth/auth.actions';
import { selectAuthUser } from '../../store/auth/auth.selectors';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatList, MatListItem } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { SearchChat } from '../search-chat/search-chat';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
  standalone: true,
  imports: [CommonModule, PinkButton, RouterLink, MatIcon, MatIconModule, MatList, MatListItem, MatButtonModule, MatBottomSheetModule, MatMenuModule],
})
export class Sidebar { // No longer needs OnInit, OnDestroy for this task
  title = () => 'AI Chat App';
  user$: Observable<User | null>;
  isAnimatingOut = false;

  isDrawerOpen = false;
  drawerOpenUsingMenu = false;
  drawerOpenUsingHover = false;

  toggleDrawer(): void {
    if (this.drawerOpenUsingHover) {
      this.isDrawerOpen = true;
      this.drawerOpenUsingHover = false;
      this.drawerOpenUsingMenu = true;
      return
    }else if(this.drawerOpenUsingMenu){
      this.drawerOpenUsingMenu = false;
      this.isDrawerOpen = false;
      return
    }else{
      this.isDrawerOpen = !this.isDrawerOpen;
    }
  }

  closeDrawer(): void {
    if(this.drawerOpenUsingMenu){
      return
    }
    this.isDrawerOpen = false;
    this.drawerOpenUsingMenu = false;
    this.drawerOpenUsingHover = false;
  }


  openDrawer(): void {
    if (!this.isDrawerOpen) {
      this.isDrawerOpen = true;
      this.drawerOpenUsingHover = true;
    }
  }

  // @ViewChild('profileTrigger') profileTrigger!: ElementRef;
  // @ViewChild('userMenuContainer') userMenuContainer!: ElementRef;

  constructor(private store: Store<AppState>) { // NgZone is no longer needed
    this.user$ = this.store.select(selectAuthUser);
    console.log(this.user$)
    effect(() => {
      console.log(this.isDrawerOpen, this.drawerOpenUsingMenu, this.drawerOpenUsingHover);
      // Perform other side effects here
    });
  }

  private _bottomSheet = inject(MatBottomSheet);

  openBottomSheet(): void {
    this._bottomSheet.open(SearchChat);
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}