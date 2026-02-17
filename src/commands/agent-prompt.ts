import { join } from 'path';
import chalk from 'chalk';
import { loadWorkflowConfig } from '../utils/yaml-parser.js';
import { generatePrompt } from '../ai/prompt-builder.js';

interface AgentPromptOptions {
  config?: string;
}

export async function agentPromptCommand(options: AgentPromptOptions): Promise<void> {
  const configPath = options.config ?? join(process.cwd(), 'workflow.yaml');

  let config;
  try {
    config = await loadWorkflowConfig(configPath);
  } catch (error) {
    console.error(chalk.red('Error: Could not load workflow.yaml'));
    console.error(chalk.gray('Run this command from a workflow project directory.'));
    process.exit(1);
  }

  const prompt = generatePrompt(config);
  console.log(prompt);
}
