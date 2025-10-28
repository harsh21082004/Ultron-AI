
export interface ContentBlock {
  type: 'text' | 'code' | 'image' | 'video' | 'table';
  value: any; 
}

export interface ChatMessage {
_id: any;
  sender: 'user' | 'ai';
  content: ContentBlock[];
  isStreaming?: boolean; // Optional flag for real-time AI responses
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export const initialChatState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
};
