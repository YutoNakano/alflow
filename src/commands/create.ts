import { join } from 'path';
import chalk from 'chalk';
import { confirm, select, input } from '@inquirer/prompts';
import { collectWorkflowConfig, writeProjectFiles } from './wizard.js';
import { buildWorkflowFromConfig } from '../core/workflow-builder.js';
import { assertSafeDirectoryName } from '../utils/path-validation.js';
import { createProvider } from '../ai/provider.js';
import type { ProviderName } from '../ai/provider.js';
import { resolveApiKey } from '../ai/api-key.js';
import { buildScriptPrompt } from '../ai/prompt-builder.js';

export async function createCommand(): Promise<void> {
  try {
    // Step 1: Collect config via interactive prompts
    const { config, scripts } = await collectWorkflowConfig();

    // Step 2: Optionally generate script with AI
    const useAI = await confirm({
      message: 'Generate script with AI?',
      default: true,
    });

    if (useAI) {
      const providerName = await select<ProviderName>({
        message: 'AI provider:',
        choices: [
          { name: 'OpenAI', value: 'openai' },
          { name: 'Anthropic', value: 'anthropic' },
          { name: 'Gemini', value: 'gemini' },
        ],
      });

      const apiKey = await resolveApiKey(providerName);

      const description = await input({
        message: 'Describe what this workflow should do:',
        validate: (value) => (value.trim() ? true : 'Description is required'),
      });

      const prompt = buildScriptPrompt(config, description);
      const provider = createProvider(providerName, apiKey);

      console.log(chalk.gray('\nGenerating script...'));
      const generated = await provider.generateScript(prompt);

      // Strip markdown code fences if present
      const script = generated
        .replace(/^```[\w]*\n/, '')
        .replace(/\n```\s*$/, '');

      // Replace the main script filter script
      scripts.set(config.input.script, script);
      console.log(chalk.green('Script generated.'));
    }

    // Step 3: Write project directory for future edits/rebuilds
    const projectDir = config.name.toLowerCase().replace(/\s+/g, '-');
    assertSafeDirectoryName(projectDir);
    await writeProjectFiles(projectDir, config, scripts);

    // Step 4: Build .alfredworkflow directly from in-memory config
    const distDir = join(projectDir, 'dist');
    const result = await buildWorkflowFromConfig(config, scripts, distDir);

    // Step 5: Print summary
    console.log(chalk.green(`\nWorkflow created successfully!`));
    console.log(`
  Project:  ${chalk.cyan(projectDir + '/')}
  Workflow: ${chalk.cyan(result.outputPath)}

  ${chalk.bold('To install:')} double-click ${chalk.cyan(result.outputPath)}
  ${chalk.bold('To rebuild:')} ${chalk.cyan(`cd ${projectDir} && alflow build`)}
  ${chalk.bold('To customize:')} edit ${chalk.cyan(projectDir + '/scripts/')} or run ${chalk.cyan('alflow agent-prompt')}
`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('User force closed')) {
      console.log('\nAborted.');
      return;
    }
    throw error;
  }
}
