'use server';

import { decomposeTask } from '@/ai/flows/decompose-task-into-steps';
import { generateContextAwareSuggestions } from '@/ai/flows/generate-context-aware-suggestions';
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
    const { steps } = await decomposeTask({ task: userInput });

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: steps.length > 0 ? steps.join(' ') : "I'm not sure how to respond to that. Can you try rephrasing?",
    };
    
    const messagesWithAssistant = [...newMessages, assistantMessage];

    const conversationHistory = messagesWithAssistant
      .map(m => `${m.role}: ${Array.isArray(m.content) ? m.content.join('\n- ') : m.content}`)
      .join('\n\n');

    const { suggestions } = await generateContextAwareSuggestions({
      conversationHistory,
      currentUserMessage: userInput,
    });
    
    // Add suggestions to the last assistant message
    if (messagesWithAssistant.length > 0) {
      const lastMsg = messagesWithAssistant[messagesWithAssistant.length - 1];
      if (lastMsg.role === 'assistant') {
        lastMsg.suggestions = suggestions;
      }
    }

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
