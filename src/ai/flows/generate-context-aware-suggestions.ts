'use server';

/**
 * @fileOverview Generates context-aware reply suggestions for the chatbot.
 *
 * - generateContextAwareSuggestions - A function that generates reply suggestions based on the current conversation.
 * - GenerateContextAwareSuggestionsInput - The input type for the generateContextAwareSuggestions function.
 * - GenerateContextAwareSuggestionsOutput - The return type for the generateContextAwareSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContextAwareSuggestionsInputSchema = z.object({
  conversationHistory: z
    .string()
    .describe('The history of the conversation as a single string.'),
  currentUserMessage: z.string().describe('The current user message.'),
});
export type GenerateContextAwareSuggestionsInput = z.infer<
  typeof GenerateContextAwareSuggestionsInputSchema
>;

const GenerateContextAwareSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested replies based on the conversation.'),
});
export type GenerateContextAwareSuggestionsOutput = z.infer<
  typeof GenerateContextAwareSuggestionsOutputSchema
>;

export async function generateContextAwareSuggestions(
  input: GenerateContextAwareSuggestionsInput
): Promise<GenerateContextAwareSuggestionsOutput> {
  return generateContextAwareSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContextAwareSuggestionsPrompt',
  input: {schema: GenerateContextAwareSuggestionsInputSchema},
  output: {schema: GenerateContextAwareSuggestionsOutputSchema},
  prompt: `You are a chatbot assistant. Generate three reply suggestions based on the current conversation and the latest user message.  The suggestions should be short, relevant, and helpful for the user to continue the conversation smoothly. Return the suggestions as a JSON array of strings.

Conversation History:
{{conversationHistory}}

Current User Message:
{{currentUserMessage}}`,
});

const generateContextAwareSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateContextAwareSuggestionsFlow',
    inputSchema: GenerateContextAwareSuggestionsInputSchema,
    outputSchema: GenerateContextAwareSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
