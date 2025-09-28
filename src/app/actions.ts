'use server';

import { generateCodeAndText } from '@/ai/flows/generate-code-and-text';
import { generateImageEdits } from '@/ai/flows/generate-image-edits';
import type { ChatState, Message } from '@/lib/types';

export async function handleUserMessage(
  prevState: ChatState,
  formData: FormData
): Promise<ChatState> {
  const userInput = formData.get('message') as string;

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
    // We only want to pass the 'user' and 'assistant' messages to the history
    const history = newMessages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map(({ role, content }) => ({ role, content }));

    const { text, code } = await generateCodeAndText({ prompt: userInput, history });

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

export type ImageEditState = {
  editedImageDataUri?: string;
  error?: string;
};

export async function handleImageEdit(
  prevState: ImageEditState,
  formData: FormData
): Promise<ImageEditState> {
  const prompt = formData.get('prompt') as string;
  const imageDataUri = formData.get('imageDataUri') as string;

  if (!prompt || !imageDataUri) {
    return { error: 'Image and prompt are required.' };
  }

  try {
    const { editedImageDataUri } = await generateImageEdits({
      imageDataUri,
      prompt,
    });
    return { editedImageDataUri };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return {
      error: `AI Error: ${errorMessage}`,
    };
  }
}
