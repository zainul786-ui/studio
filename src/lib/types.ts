export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string | string[];
  suggestions?: string[];
};

export type ChatState = {
  messages: Message[];
  error?: string | undefined;
};
