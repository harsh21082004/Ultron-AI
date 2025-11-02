import { Component, inject, OnDestroy, OnInit } from '@angular/core'; // Import HostListener
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { AppState } from '../../../store';
import { User } from '../../models/user.model';
import * as AuthActions from '../../../store/auth/auth.actions';
import { selectAuthUser } from '../../../store/auth/auth.selectors';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatList, MatListItem } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { SearchChat } from '../search-chat/search-chat.component';
import { MatMenuModule } from '@angular/material/menu'; 
import * as ChatActions from '../../../store/chat/chat.actions';
import { selectAllChats } from '../../../store/chat/chat.selectors';

@Component({
  selector: 'app-sidebar-component',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, MatIcon, MatIconModule, MatList, MatListItem, MatButtonModule, MatBottomSheetModule, MatMenuModule],
})
export class SidebarComponent implements OnInit, OnDestroy{ // No longer needs OnInit, OnDestroy for this task
  title = () => 'AI Chat App';
  user$: Observable<User | null>;
  chats$: Observable<any[]>;
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

  
  private userSubscription!: Subscription;

  constructor(private store: Store<AppState>) { // NgZone is no longer needed
    this.user$ = this.store.select(selectAuthUser);
    this.chats$ = this.store.select(selectAllChats)
  }

  ngOnInit(): void {
    // When the user logs in, fetch their chats
    this.userSubscription = this.user$.subscribe(user => {
      // Assuming user model has '_id' property, as backend uses 'req.user.id'
      if (user?._id) { 
        this.store.dispatch(ChatActions.getAllChats({ userId: user._id }));
      }
    });
  }

  // --- NEW: ngOnDestroy to prevent memory leaks ---
  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
 
  private _bottomSheet = inject(MatBottomSheet);

  openBottomSheet(): void {
    this._bottomSheet.open(SearchChat);
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}