import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { GeminiProvider } from './gemini.js';

export interface AIProvider {
  generateScript(prompt: string): Promise<string>;
}

export type ProviderName = 'openai' | 'anthropic' | 'gemini';

export function createProvider(name: ProviderName, apiKey: string): AIProvider {
  switch (name) {
    case 'openai':
      return new OpenAIProvider(apiKey);
    case 'anthropic':
      return new AnthropicProvider(apiKey);
    case 'gemini':
      return new GeminiProvider(apiKey);
  }
}
