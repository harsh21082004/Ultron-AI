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

  messages$: Observable<ChatMessage[]>;
  isLoading$: Observable<boolean>;
  user$: Observable<User | null>;
  chatForm: FormGroup;

  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private currentChatId: string | null = null;
  private messagesSubscription!: Subscription;

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
    this.route.paramMap.subscribe(params => {
      const chatId = params.get('id');
      if (chatId) {
        this.currentChatId = chatId;
        this.store.dispatch(ChatActions.loadChatHistory({ chatId }));
      } else {
        // --- THIS IS THE FIX ---
        // If there is no chat ID, we are in a new chat.
        // Clear the previous chat's messages from the store.
        this.currentChatId = null;
        this.store.dispatch(ChatActions.loadChatHistorySuccess({ messages: [] }));
      }
    });
  }

  autoGrow(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    
    // Reset height to 'auto' to correctly calculate scrollHeight
    textarea.style.height = 'auto';

    const computedStyle = getComputedStyle(textarea);
    // Calculate line-height, fallback to font-size * 1.2
    const lineHeight = parseFloat(computedStyle.lineHeight) || (parseFloat(computedStyle.fontSize) * 1.2);
    
    // Calculate max height for 4 lines
    // We also need to account for padding
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
    // 💡 NEW: Subscribe to changes in the message list QueryList
    // The scroll logic is now tied to when a new message element is added to the DOM.
    this.messageElements.changes.subscribe((list: QueryList<ElementRef>) => {
      // We only scroll if there are messages and the last one is the AI's response
      if (list.length > 0) {
        this.scrollToLastMessage();
      }
    });
  }

  ngOnDestroy(): void {

  }

  private scrollToLastMessage(): void {
    // Use setTimeout to ensure DOM updates are complete (especially during streaming)
    setTimeout(() => {
      try {
        const elements = this.messageElements.toArray();
        if (elements.length > 0) {
          // Get the last message element
          const lastElement = elements[elements.length - 1].nativeElement;

          // Scroll the container to the top of the last message element
          lastElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

          // If you still prefer scrolling the container itself to a position:
          // this.chatContainer.nativeElement.scrollTop = lastElement.offsetTop - this.chatContainer.nativeElement.offsetTop;
        }
      } catch (err) {
        // Safe to ignore if the element isn't ready.
      }
    }, 50); // Increased timeout slightly for reliable scrolling during streaming
  }

  sendMessage(): void {
    const message = this.chatForm.value.message?.trim();
    if (message) {
      this.handleNewMessage(message);
      this.chatForm.reset();
    }
  }

  sendSuggestion(prompt: string): void {
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