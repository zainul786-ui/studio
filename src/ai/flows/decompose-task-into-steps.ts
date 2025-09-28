'use server';

/**
 * @fileOverview Decomposes a complex task into a series of actionable steps.
 *
 * @file Zaidev's complex task decomposition agent.
 * - decomposeTask - A function that decomposes a complex task into a series of actionable steps.
 * - DecomposeTaskInput - The input type for the decomposeTask function.
 * - DecomposeTaskOutput - The return type for the decomposeTask function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DecomposeTaskInputSchema = z.object({
  task: z
    .string()
    .describe(
      'The complex task to be decomposed into a series of actionable steps.'
    ),
});
export type DecomposeTaskInput = z.infer<typeof DecomposeTaskInputSchema>;

const DecomposeTaskOutputSchema = z.object({
  steps: z.array(z.string()).describe('The list of actionable steps.'),
});
export type DecomposeTaskOutput = z.infer<typeof DecomposeTaskOutputSchema>;

export async function decomposeTask(input: DecomposeTaskInput): Promise<DecomposeTaskOutput> {
  return decomposeTaskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'decomposeTaskPrompt',
  input: {schema: DecomposeTaskInputSchema},
  output: {schema: DecomposeTaskOutputSchema},
  prompt: `You are an AI task decomposition expert. Your job is to take a complex task and break it down into a series of actionable steps.

Task: {{{task}}}

Steps:`,
});

const decomposeTaskFlow = ai.defineFlow(
  {
    name: 'decomposeTaskFlow',
    inputSchema: DecomposeTaskInputSchema,
    outputSchema: DecomposeTaskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
