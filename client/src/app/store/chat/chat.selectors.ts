import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ChatState } from './chat.state';

export const selectChatState = createFeatureSelector<ChatState>('chat');

export const selectChatMessages = createSelector(
  selectChatState,
  (state) => state.messages
);

export const selectIsLoading = createSelector(
  selectChatState,
  (state) => state.isLoading
);

export const selectChatError = createSelector(
  selectChatState,
  (state) => state.error
);
