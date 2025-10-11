import { Component, ElementRef, ViewChild, AfterViewChecked, ChangeDetectionStrategy, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../../store';
import * as ChatActions from '../../store/chat/chat.actions';
import { selectChatMessages, selectIsLoading } from '../../store/chat/chat.selectors';
import { ChatMessage } from '../../store/chat/chat.state';
import { User } from '../../models/user.model';
import { selectAuthUser } from '../../store/auth/auth.selectors';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule as MatIcon } from '@angular/material/icon';
import { Header } from "../header/header";


// Custom Validator function
export function noWhitespaceValidator(control: any) {
  const isWhitespace = (control.value || '').trim().length === 0;
  return isWhitespace ? { 'whitespace': true } : null;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIcon, MatMenuModule, MatButtonModule, Header],
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  
  messages$: Observable<ChatMessage[]>;
  isLoading$: Observable<boolean>;
  user$: Observable<User | null>;
  chatForm: FormGroup;

  promptSuggestions = [
    {
      "title": "Consolidate financial data from all subsidiaries",
      "description": "Hi Consolidate financial data from all subsidiaries Consolidate financial data from all subsidiaries"
    },
    {
      "title": "Consolidate financial data from all subsidiaries",
      "description": "Hi Consolidate financial data from all subsidiaries Consolidate financial data from all subsidiaries"
    },
    {
      "title": "Consolidate financial data from all subsidiaries",
      "description": "Hi Consolidate financial data from all subsidiaries Consolidate financial data from all subsidiaries"
    }
  ]
  
  constructor(private store: Store<AppState>, private fb: FormBuilder) {
    this.messages$ = this.store.select(selectChatMessages);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.user$ = this.store.select(selectAuthUser);

    
    this.chatForm = this.fb.group({
      message: ['', [Validators.required, noWhitespaceValidator]],
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (this.chatForm.invalid) {
      return;
    }
    const message = this.chatForm.value.message.trim();
    if (message) {
      this.store.dispatch(ChatActions.sendMessage({ message }));
      this.chatForm.reset();
    }
  }

  sendSuggestion(prompt: string): void {
    this.store.dispatch(ChatActions.sendMessage({ message: prompt }));
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
}
