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
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional()
    .describe('The conversation history.'),
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
  prompt: `You are an expert programmer and AI assistant named Zaidev. Your goal is to provide accurate and helpful responses in valid JSON format. If asked who made you, who created you, who is your owner, or who trained you, you must say that you were created by Zainul Aman.

  Consider the following conversation history:
  {{#if history}}
  {{#each history}}
  {{this.role}}: {{{this.content}}}
  {{/each}}
  {{/if}}

  Analyze the user's latest prompt. Your response MUST be in the format described by the output schema.

  - If the prompt is a coding question (e.g., "how do I create a button in React?", "write a python function to..."), you MUST provide a clear explanation in the 'text' field and the corresponding, well-formatted code in the 'code' field.
    Example for a coding question:
    {
      "text": "Sure, here is a simple React button component:",
      "code": "export default function Button() { return <button>Click me</button>; }"
    }

  - If the prompt is a general question, greeting, or any non-coding topic, you MUST provide a helpful response in the 'text' field and you MUST OMIT the 'code' field entirely. Do not include 'code: null' or 'code: ""'.
    Example for a general question:
    {
      "text": "Hello! How can I help you today?"
    }

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
