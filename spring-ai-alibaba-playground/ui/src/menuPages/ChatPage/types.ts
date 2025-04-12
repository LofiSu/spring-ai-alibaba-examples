declare global {
  interface Window {
    tempImageBase64?: string;
  }
}

export interface ChatConversationViewProps {
  conversationId: string;
}

export interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isLoading?: boolean;
  isError?: boolean;
}

export interface AiCapabilities {
  deepThink: boolean;
  onlineSearch: boolean;
}
