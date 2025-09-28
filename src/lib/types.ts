export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  code?: string;
  imageUrl?: string;
};

export type ChatState = {
  messages: Message[];
  error?: string | undefined;
};
