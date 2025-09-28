'use server';

import { generateCodeAndText } from '@/ai/flows/generate-code-and-text';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import type { ChatState, Message } from '@/lib/types';

export async function handleUserMessage(
  prevState: ChatState,
  formData: FormData
): Promise<ChatState> {
  const userInput = formData.get('message') as string;
  const username = formData.get('username') as string | undefined;

  if (!userInput) {
    return { ...prevState, error: 'Message is required.' };
  }

  const userMessage: Message = {
    id: crypto.randomUUID(),
    role: 'user',
    content: userInput,
  };

  const newMessages = [...prevState.messages, userMessage];

  try {
    const history = newMessages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map(({ role, content }) => ({ role, content }));

    const { text, code } = await generateCodeAndText({ prompt: userInput, history, username });

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: text,
      code: code,
    };
    
    const messagesWithAssistant = [...newMessages, assistantMessage];

    return {
      messages: messagesWithAssistant,
    };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return {
      messages: newMessages,
      error: `AI Error: ${errorMessage}`,
    };
  }
}

export async function convertTextToSpeech(text: string): Promise<{ audioDataUri: string } | { error: string }> {
  try {
    const { audioDataUri } = await textToSpeech({ text });
    return { audioDataUri };
  } catch (error) {
    console.error('TTS Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during text-to-speech conversion.';
    return { error: errorMessage };
  }
}
