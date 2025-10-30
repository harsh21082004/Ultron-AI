import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom, endWith, filter } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as ChatActions from './chat.actions';
import { AppState } from '..';
import { selectChatMessages } from './chat.selectors';
import { ChatApiService } from '../../services/chat-api.services';
import { ChatDbService } from '../../services/chat-db.service';
import { selectAuthUser } from '../auth/auth.selectors';

@Injectable()
export class ChatEffects {
  private actions$ = inject(Actions);
  private store = inject(Store<AppState>);
  private chatApiService = inject(ChatApiService); // For FastAPI streaming
  private chatDbService = inject(ChatDbService);   // For Express DB operations

  /**
   * Effect to load a chat's history FROM THE EXPRESS BACKEND.
   */
  loadHistory$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ChatActions.loadChatHistory),
      switchMap(action =>
        this.chatDbService.getChatHistory(action.chatId).pipe(
          map(messages => ChatActions.loadChatHistorySuccess({ messages })),
          catchError(error => of(ChatActions.loadChatHistoryFailure({ error: error.message })))
        )
      )
    );
  });

  /**
   * Effect to initiate the real-time streaming FROM THE FASTAPI BACKEND.
   */
  sendMessage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ChatActions.sendMessage),
      switchMap(action =>
        this.chatApiService.sendMessageStream(action.message, action.chatId).pipe(
          map(chunk => ChatActions.receiveStreamChunk({ chunk })),
          // When the stream completes, dispatch the streamComplete action with the chatId.
          endWith(ChatActions.streamComplete({ chatId: action.chatId })),
          catchError(error => of(ChatActions.streamFailure({ error: error.message })))
        )
      )
    );
  });

  /**
   * Helper effect to add an empty AI message bubble to the UI.
   */
  startStream$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ChatActions.sendMessage),
      map(() => ChatActions.streamStarted())
    )
  });

  /**
   * Effect to save the completed chat history TO THE EXPRESS BACKEND.
   */
  saveOnStreamComplete$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ChatActions.streamComplete),
      withLatestFrom(this.store.select(selectChatMessages)),
      switchMap(([action, messages]) => {
        const chatId = action.chatId;

        if (!chatId || messages.length < 2) {
          // Not enough info to save, just fail silently or with a specific action
          return of(ChatActions.saveChatHistoryFailure({ error: 'Missing data to save chat.' }));
        }

        // --- NEW STEP 1: Call FastAPI to generate a title ---
        return this.chatApiService.generateTitle(messages).pipe(
          switchMap(titleResponse => {
            // --- NEW STEP 2: Use the AI title to save to the DB ---
            const aiTitle = titleResponse.title || 'New Chat'; // Use response or fallback
            return this.chatDbService.saveChat(chatId, messages, aiTitle).pipe(
              map(() => ChatActions.saveChatHistorySuccess()),
              catchError(error => of(ChatActions.saveChatHistoryFailure({ error: error.message })))
            );
          }),
          catchError(titleError => {
            // Handle error from title generation
            // We can still save the chat with a default title
            console.error("Failed to generate AI title, saving with default.", titleError);

            // Fallback: Create title from the first user message
            const firstUserMessage = messages.find(m => m.sender === 'user');
            const firstTextContent = firstUserMessage?.content.find(c => c.type === 'text');
            const defaultTitle = (firstTextContent?.value as string)?.substring(0, 50) || 'New Chat';

            return this.chatDbService.saveChat(chatId, messages, defaultTitle).pipe(
              map(() => ChatActions.saveChatHistorySuccess()),
              catchError(dbError => of(ChatActions.saveChatHistoryFailure({ error: dbError.message })))
            );
          })
        );
      })
    );
  });

  getAllChats$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ChatActions.getAllChats),
      switchMap(action =>
        this.chatDbService.getAllChats(action.userId).pipe(
          map(chats => ChatActions.getAllChatsSuccess({ chats })),
          catchError(error => of(ChatActions.getAllChatsFailure({ error: error.message })))
        )
      ))
  })

  refetchChatsAfterSave$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ChatActions.saveChatHistorySuccess), // Trigger on successful save
      withLatestFrom(this.store.select(selectAuthUser)), // Get the current user
      filter(([action, user]) => !!user), // Only proceed if the user is logged in
      map(([action, user]) => {
        // Dispatch the action to get all chats for this user
        // We use user!._id because the filter above ensures user is not null.
        return ChatActions.getAllChats({ userId: user!._id });
      })
    );
  });

  constructor() { }
}
