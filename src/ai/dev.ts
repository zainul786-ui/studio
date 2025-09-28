import { config } from 'dotenv';
config();

import '@/ai/flows/generate-image-edits.ts';
import '@/ai/flows/generate-context-aware-suggestions.ts';
import '@/ai/flows/decompose-task-into-steps.ts';