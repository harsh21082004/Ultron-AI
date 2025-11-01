import { Component, ElementRef, ViewChild, ChangeDetectionStrategy, inject, OnInit, OnDestroy, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

// --- Your Project Imports ---
import { AppState } from '../../store';
import * as ChatActions from '../../store/chat/chat.actions';
import { selectChatMessages, selectIsLoading } from '../../store/chat/chat.selectors';
import { ChatMessage } from '../../store/chat/chat.state';
import { User } from '../../models/user.model';
import { selectAuthUser } from '../../store/auth/auth.selectors';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HeaderComponent } from '../header/header';
import { ContentRenderer } from "../content-renderer/content-renderer";
import { UltronLoaderComponent } from "../ultron-loader/ultron-loader";

// Custom Validator function
export function noWhitespaceValidator(control: any) {
  const isWhitespace = (control.value || '').trim().length === 0;
  return isWhitespace ? { 'whitespace': true } : null;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatProgressSpinnerModule, HeaderComponent, ContentRenderer,
    UltronLoaderComponent
  ],
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChildren('messageElement') private messageElements!: QueryList<ElementRef>;
  // We'll use this to find the textarea to reset its height
  @ViewChild('chatTextarea') private chatTextarea!: ElementRef<HTMLTextAreaElement>;

  messages$: Observable<ChatMessage[]>;
  isLoading$: Observable<boolean>;
  user$: Observable<User | null>;
  chatForm: FormGroup;

  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private currentChatId: string | null = null;
  private routeSub!: Subscription;
  private messagesSub!: Subscription;

  // --- NEW: State for controlling scroll behavior ---
  private scrollBehavior: ScrollLogicalPosition = 'start';

  promptSuggestions = [
    { title: "Smart Budget", description: "A budget that fits your lifestyle." },
    { title: "Analytics", description: "Empower smarter decisions." },
    { title: "Spending", "description": "Track your financial resources." }
  ];

  constructor(private store: Store<AppState>, private fb: FormBuilder) {
    this.messages$ = this.store.select(selectChatMessages);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.user$ = this.store.select(selectAuthUser);

    this.chatForm = this.fb.group({
      message: ['', [Validators.required, noWhitespaceValidator]],
    });
  }

  ngOnInit(): void {
    // Listen for changes to the URL's 'id' parameter
    this.route.paramMap.subscribe(params => {
      const chatId = params.get('id'); // Get the 'id' from the URL

      if (chatId) {
        // We are in an existing chat.
        // Dispatch the action to load its history.
        this.store.dispatch(ChatActions.loadChatHistory({ chatId }));
      } else {
        // We are on the "new chat" page (e.g., /chat).
        // Dispatch the action to clear any "stuck" messages.
        this.store.dispatch(ChatActions.clearActiveChat());
      }
    });
  }

  /**
   * --- NEW: Auto-grows the textarea up to 4 lines ---
   */
  autoGrow(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    
    // Reset height to 'auto' to correctly calculate scrollHeight
    textarea.style.height = 'auto';

    const computedStyle = getComputedStyle(textarea);
    const lineHeight = parseFloat(computedStyle.lineHeight) || (parseFloat(computedStyle.fontSize) * 1.2);
    
    // Calculate max height for 4 lines
    const padding = parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
    const maxHeight = (lineHeight * 4) + padding;

    const scrollHeight = textarea.scrollHeight;

    if (scrollHeight > maxHeight) {
      textarea.style.height = `${maxHeight}px`;
      textarea.style.overflowY = 'auto'; // Show scrollbar
    } else {
      textarea.style.height = `${scrollHeight}px`;
      textarea.style.overflowY = 'hidden'; // Hide scrollbar
    }
  }

  ngAfterViewInit(): void {
    // Store the subscription to unsubscribe OnDestroy
    this.messagesSub = this.messageElements.changes.subscribe((list: QueryList<ElementRef>) => {
      if (list.length > 0) {
          this.scrollToLastMessage();
      }
    });
  }

  ngOnDestroy(): void {
    // --- NEW: Clean up subscriptions ---
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.messagesSub) {
      this.messagesSub.unsubscribe();
    }
  }

  private scrollToLastMessage(): void {
    setTimeout(() => {
      try {
        const elements = this.messageElements.toArray();
        if (elements.length > 0) {
          const lastElement = elements[elements.length - 1].nativeElement;
          
          // --- UPDATED: Use the dynamic scroll behavior ---
          lastElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: this.scrollBehavior // Use 'start' or 'end'
          });
          
          // --- NEW: Reset behavior to 'start' ---
          // After loading, all new messages (AI or user) should scroll to the start.
          if (this.scrollBehavior === 'end') {
            this.scrollBehavior = 'start';
          }
        }
      } catch (err) {
        // Safe to ignore
      }
    }, 50);
  }

  sendMessage(): void {
    const message = this.chatForm.value.message?.trim();
    if (message) {
      // REQ 2: When sending, set scroll to START
      this.scrollBehavior = 'start';
      this.handleNewMessage(message);
      this.chatForm.reset();

      // --- NEW: Reset textarea height ---
      if (this.chatTextarea) {
        this.chatTextarea.nativeElement.style.height = 'auto';
        this.chatTextarea.nativeElement.style.overflowY = 'hidden';
      }
    }
  }

  sendSuggestion(prompt: string): void {
    // REQ 2: When sending, set scroll to START
    this.scrollBehavior = 'start';
    this.handleNewMessage(prompt);
  }

  handleEnterPress(event: KeyboardEvent): void {
    if (!event.shiftKey && this.chatForm.valid && event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private handleNewMessage(message: string): void {
    const chatId = this.currentChatId ?? crypto.randomUUID();

    if (!this.currentChatId) {
      this.currentChatId = chatId;
      this.location.replaceState(`/chat/${chatId}`);
    }

    this.store.dispatch(ChatActions.sendMessage({ message, chatId }));
  }
}
