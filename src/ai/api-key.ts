import { password } from '@inquirer/prompts';
import type { ProviderName } from './provider.js';

const ENV_VAR_MAP: Record<ProviderName, string> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  gemini: 'GEMINI_API_KEY',
};

export async function resolveApiKey(provider: ProviderName): Promise<string> {
  const envVar = ENV_VAR_MAP[provider];
  const fromEnv = process.env[envVar];

  if (fromEnv) {
    return fromEnv;
  }

  const key = await password({
    message: `Enter your ${envVar}:`,
    validate: (value) => (value.trim() ? true : 'API key is required'),
  });

  return key;
}
