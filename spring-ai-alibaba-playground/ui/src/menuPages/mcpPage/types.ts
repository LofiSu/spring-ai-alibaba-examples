export interface McpConversationViewProps {
  conversationId: string;
}

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export interface McpMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isLoading?: boolean;
  isError?: boolean;
}

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export interface InputResultProps {
  messages: Message[];
  title?: string;
}
