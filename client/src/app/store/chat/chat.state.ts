
export interface ContentBlock {
  type: 'text' | 'code' | 'image' | 'video' | 'table';
  value: any; 
}

export interface ChatSummary {
  _id: string;
  title: string;
}

export interface ChatMessage {
_id: any;
  sender: 'user' | 'ai';
  content: ContentBlock[];
  isStreaming?: boolean; // Optional flag for real-time AI responses
}

export interface ChatState {
  messages: ChatMessage[];
  chatList: ChatSummary[];
  isLoading: boolean;
  error: string | null;
}

export const initialChatState: ChatState = {
  messages: [],
  chatList: [],
  isLoading: false,
  error: null,
};
