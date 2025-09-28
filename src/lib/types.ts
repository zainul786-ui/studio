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

export type User = {
  username: string;
  password?: string; // Keep password optional for security, only used for signup/login
  profileImage?: string; // data URI for the image
};
