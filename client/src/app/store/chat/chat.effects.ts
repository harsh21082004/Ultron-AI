import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom, endWith } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as ChatActions from './chat.actions';
import { AppState } from '..';
import { selectChatMessages } from './chat.selectors';
import { ChatApiService } from '../../services/chat-api.services';
import { ChatDbService } from '../../services/chat-db.service';

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
          return of(ChatActions.saveChatHistoryFailure({ error: 'Missing data to save chat.'}));
        }
        
        return this.chatDbService.saveChat(chatId, messages).pipe(
          map(() => ChatActions.saveChatHistorySuccess()),
          catchError(error => of(ChatActions.saveChatHistoryFailure({ error: error.message })))
        );
      })
    );
  });

  constructor() {}
}

