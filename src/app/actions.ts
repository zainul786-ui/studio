'use server';

import { generateCodeAndText } from '@/ai/flows/generate-code-and-text';
import { generateImageEdits } from '@/ai/flows/generate-image-edits';
import type { ChatState, Message } from '@/lib/types';

export async function handleUserMessage(
  prevState: ChatState,
  formData: FormData
): Promise<ChatState> {
  const userInput = formData.get('message') as string;
  const imageDataUri = formData.get('imageDataUri') as string | null;

  if (!userInput) {
    return { ...prevState, error: 'Message is required.' };
  }

  const userMessage: Message = {
    id: crypto.randomUUID(),
    role: 'user',
    content: userInput,
    imageUrl: imageDataUri || undefined,
  };

  const newMessages = [...prevState.messages, userMessage];

  try {
    let assistantMessage: Message;

    if (imageDataUri) {
      // Image editing task
      const { editedImageDataUri } = await generateImageEdits({
        imageDataUri,
        prompt: userInput,
      });
      assistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "Here's the edited image:",
        imageUrl: editedImageDataUri,
      };
    } else {
      // Text/code generation task
      const history = newMessages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map(({ role, content }) => ({ role, content }));

      const { text, code } = await generateCodeAndText({ prompt: userInput, history });

      assistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: text,
        code: code,
      };
    }
    
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
