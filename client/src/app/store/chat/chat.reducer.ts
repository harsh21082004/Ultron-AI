import { createReducer, on } from '@ngrx/store';
import { initialChatState, ChatMessage, ContentBlock } from './chat.state';
import * as ChatActions from './chat.actions';

export const chatReducer = createReducer(
  initialChatState,

  // --- Handlers for Loading Chat History ---
  // This is triggered when the page loads with a chat ID.
  on(ChatActions.loadChatHistory, (state) => ({
    ...state,
    isLoading: true,
    error: null,
    messages: [], // Clear old messages while loading history
  })),

  on(ChatActions.clearActiveChat, (state) => ({
    ...initialChatState,       // Reset to the default empty state
    chatList: state.chatList, // IMPORTANT: Keep the chat list that's already loaded
  })),

  // This handles the successful response from the API.
  on(ChatActions.loadChatHistorySuccess, (state, { messages }) => ({
    ...state,
    isLoading: false,
    messages: messages,
  })),

  // This handles any errors during the API call.
  on(ChatActions.loadChatHistoryFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error: error,
  })),

  // --- Handlers for Real-Time Chat ---
  on(ChatActions.sendMessage, (state, { message }) => ({
    ...state,
    isLoading: true,
    error: null,
    messages: [
      ...state.messages,
      {
        sender: 'user',
        content: [{ type: 'text', value: message }],
        _id: crypto.randomUUID()
      },
    ],
  })),

  on(ChatActions.streamStarted, (state) => ({
    ...state,
    isLoading: false,
    messages: [
      ...state.messages,
      { sender: 'ai', content: [], isStreaming: true, _id: "temp-id" },

    ],
  })),

  on(ChatActions.receiveStreamChunk, (state, { chunk }) => {
    if (state.messages.length === 0) return state;
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage?.sender !== 'ai' || !lastMessage.isStreaming) return state;

    const lastContentBlock = lastMessage.content[lastMessage.content.length - 1];
    let newContent: ContentBlock[];

    if (lastContentBlock?.type === 'text') {
      newContent = [
        ...lastMessage.content.slice(0, -1),
        { ...lastContentBlock, value: lastContentBlock.value + chunk }
      ];
    } else {
      newContent = [...lastMessage.content, { type: 'text', value: chunk }];
    }

    return {
      ...state,
      messages: [
        ...state.messages.slice(0, -1),
        { ...lastMessage, content: newContent }
      ]
    };
  }),

  on(ChatActions.streamComplete, (state) => {
    if (state.messages.length === 0) return state;
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage?.sender !== 'ai') return state;

    return {
      ...state,
      isLoading: false,
      messages: [
        ...state.messages.slice(0, -1),
        { ...lastMessage, isStreaming: false }
      ]
    };
  }),

  on(ChatActions.streamFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error: error,
  })),

  on(ChatActions.getAllChats,(state)=> ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(ChatActions.getAllChatsSuccess, (state, { chats }) => ({
    ...state,
    isLoading: false,
    chatList: chats,
  })),

  on(ChatActions.getAllChatsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error: error,
  }))
);

