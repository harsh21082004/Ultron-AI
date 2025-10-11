export interface ChatMessage {
  sender: 'user' | 'ai';
  content: string;
  isStreaming?: boolean; // Optional flag to know if this AI message is still being generated
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean; // True when we are waiting for the first chunk
  error: string | null;
}

export const initialChatState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
};
