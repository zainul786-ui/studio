'use server';

/**
 * @fileOverview A flow that generates both text and a code snippet in response to a prompt.
 *
 * - generateCodeAndText - A function that returns a text response and an optional code snippet.
 * - GenerateCodeAndTextInput - The input type for the function.
 * - GenerateCodeAndTextOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCodeAndTextInputSchema = z.object({
  prompt: z.string().describe('The user prompt or question.'),
});
export type GenerateCodeAndTextInput = z.infer<typeof GenerateCodeAndTextInputSchema>;

const GenerateCodeAndTextOutputSchema = z.object({
  text: z.string().describe('The text part of the response.'),
  code: z.string().optional().describe('The code snippet, if any.'),
});
export type GenerateCodeAndTextOutput = z.infer<typeof GenerateCodeAndTextOutputSchema>;

export async function generateCodeAndText(
  input: GenerateCodeAndTextInput
): Promise<GenerateCodeAndTextOutput> {
  return generateCodeAndTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeAndTextPrompt',
  input: { schema: GenerateCodeAndTextInputSchema },
  output: { schema: GenerateCodeAndTextOutputSchema },
  prompt: `You are an expert programmer and AI assistant. 
  
  Analyze the user's prompt. 
  
  - If the prompt is a coding question (e.g., "how do I create a button in React?", "write a python function to..."), provide a clear explanation in the 'text' field and the corresponding code in the 'code' field.
  - If the prompt is a general question or greeting, provide a helpful response in the 'text' field and leave the 'code' field empty.
  - If the prompt is a request to decompose a task, break it down into steps in the 'text' field.

  User Prompt: {{{prompt}}}
  `,
});

const generateCodeAndTextFlow = ai.defineFlow(
  {
    name: 'generateCodeAndTextFlow',
    inputSchema: GenerateCodeAndTextInputSchema,
    outputSchema: GenerateCodeAndTextOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
