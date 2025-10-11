import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';
import { ChatApiService } from '../../services/chat.services';
import * as ChatActions from './chat.actions';

@Injectable()
export class ChatEffects {
  private actions$ = inject(Actions);
  private chatApiService = inject(ChatApiService);

  sendMessage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ChatActions.sendMessage),
      switchMap(action => {
        // When a 'sendMessage' action is dispatched, call the service to start the stream.
        let streamStartedDispatched = false;
        
        return this.chatApiService.sendMessageStream(action.message).pipe(
          map(chunk => {
            // For the very first chunk, also dispatch the streamStarted action
            if (!streamStartedDispatched) {
              streamStartedDispatched = true;
              // This is a way to dispatch multiple actions from one emission
              // but it's cleaner to handle this in the component or with a more complex effect.
              // For simplicity, we'll start the AI message immediately.
              // A better pattern would be another effect listening for sendMessage to dispatch streamStarted.
            }
            // For every chunk of data from the stream, dispatch a 'receiveStreamChunk' action.
            return ChatActions.receiveStreamChunk({ chunk });
          }),
          // When the stream completes, catchError won't be called for completion.
          // We need a way to know when it's done. A "finally" or "finalize" operator is ideal.
          // For now, we assume the component will handle the final state.
          // A more robust solution involves an END_STREAM action.
          catchError(error => of(ChatActions.streamFailure({ error: error.message })))
        );
      })
    );
  });
  
  // A helper effect to add the initial AI message bubble
  startStream$ = createEffect(() => {
      return this.actions$.pipe(
          ofType(ChatActions.sendMessage),
          map(() => ChatActions.streamStarted())
      )
  });

  constructor() {}
}
