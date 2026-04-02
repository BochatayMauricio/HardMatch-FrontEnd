export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
}

export interface ChatResponse {
  success: boolean;
  reply: string;
}