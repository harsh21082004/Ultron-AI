import { createReducer, on } from '@ngrx/store';
import { initialChatState, ChatMessage } from './chat.state';
import * as ChatActions from './chat.actions';

export const chatReducer = createReducer(
  initialChatState,

  // When the user sends a message, add it to the list and set loading state
  on(ChatActions.sendMessage, (state, { message }) => ({
    ...state,
    isLoading: true,
    error: null,
    messages: [...state.messages, { sender: 'user', content: message }],
  })),

  // When the stream starts, add a new, empty AI message to the list
  on(ChatActions.streamStarted, (state) => ({
    ...state,
    isLoading: false,
    messages: [...state.messages, { sender: 'ai', content: '', isStreaming: true }],
  })),

  // For each chunk, find the last AI message and append the new text
  on(ChatActions.receiveStreamChunk, (state, { chunk }) => {
    const newMessages = [...state.messages];
    const lastMessage = newMessages[newMessages.length - 1];

    if (lastMessage && lastMessage.sender === 'ai') {
      // Append the chunk to the content of the last AI message
      newMessages[newMessages.length - 1] = {
        ...lastMessage,
        content: lastMessage.content + chunk,
      };
    }

    return { ...state, messages: newMessages };
  }),

  // When the stream is complete, find the last AI message and mark it as no longer streaming
  on(ChatActions.streamComplete, (state) => {
    const newMessages = [...state.messages];
    const lastMessage = newMessages[newMessages.length - 1];

    if (lastMessage && lastMessage.sender === 'ai') {
      newMessages[newMessages.length - 1] = { ...lastMessage, isStreaming: false };
    }
    return { ...state, isLoading: false, messages: newMessages };
  }),

  // Handle any errors from the stream
  on(ChatActions.streamFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error: error,
  }))
);
