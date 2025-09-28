// Implemented by Gemini.
'use server';
/**
 * @fileOverview Image editing flow using natural language prompts.
 *
 * - generateImageEdits - A function that edits an image based on a text prompt.
 * - GenerateImageEditsInput - The input type for the generateImageEdits function.
 * - GenerateImageEditsOutput - The return type for the generateImageEdits function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageEditsInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The image to edit, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().describe('The prompt to use for editing the image.'),
});
export type GenerateImageEditsInput = z.infer<typeof GenerateImageEditsInputSchema>;

const GenerateImageEditsOutputSchema = z.object({
  editedImageDataUri: z
    .string()
    .describe('The edited image as a data URI.'),
});
export type GenerateImageEditsOutput = z.infer<typeof GenerateImageEditsOutputSchema>;

export async function generateImageEdits(
  input: GenerateImageEditsInput
): Promise<GenerateImageEditsOutput> {
  return generateImageEditsFlow(input);
}

const generateImageEditsFlow = ai.defineFlow(
  {
    name: 'generateImageEditsFlow',
    inputSchema: GenerateImageEditsInputSchema,
    outputSchema: GenerateImageEditsOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {media: {url: input.imageDataUri}},
        {text: input.prompt},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {editedImageDataUri: media.url!};
  }
);
