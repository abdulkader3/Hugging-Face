import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: 'your-openai-api-key',
  dangerouslyAllowBrowser: true // Only use this for development
}); 