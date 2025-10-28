import { createAction, props } from '@ngrx/store';
import { ChatMessage } from './chat.state';

// --- ACTIONS FOR LOADING HISTORY ---
export const loadChatHistory = createAction(
  '[Chat API] Load Chat History',
  props<{ chatId: string }>()
);

export const loadChatHistorySuccess = createAction(
  '[Chat API] Load Chat History Success',
  props<{ messages: ChatMessage[] }>()
);

export const loadChatHistoryFailure = createAction(
  '[Chat API] Load Chat History Failure',
  props<{ error: string }>()
);

// --- ACTIONS FOR SAVING HISTORY ---
export const saveChatHistory = createAction(
  '[Chat API] Save Chat History',
  props<{ chatId: string; messages: ChatMessage[] }>()
);
export const saveChatHistorySuccess = createAction(
  '[Chat API] Save Chat History Success'
);
export const saveChatHistoryFailure = createAction(
  '[Chat API] Save Chat History Failure',
  props<{ error: string }>()
);


// --- ACTIONS FOR REAL-TIME CHAT ---
export const sendMessage = createAction(
  '[Chat] Send Message',
  props<{ message: string; chatId: string }>()
);

export const streamStarted = createAction(
  '[Chat] Stream Started'
);

export const receiveStreamChunk = createAction(
  '[Chat] Receive Stream Chunk',
  props<{ chunk: string }>()
);

// CORRECTED: This action now carries the chatId in its payload.
export const streamComplete = createAction(
  '[Chat] Stream Complete',
  props<{ chatId: string }>()
);

export const streamFailure = createAction(
  '[Chat] Stream Failure',
  props<{ error: string }>()
);
