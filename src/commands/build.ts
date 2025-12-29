import { join } from 'path';
import chalk from 'chalk';
import { buildWorkflow } from '../core/workflow-builder.js';

interface BuildOptions {
  config?: string;
}

export async function buildCommand(options: BuildOptions): Promise<void> {
  const configPath = options.config ?? join(process.cwd(), 'workflow.yaml');

  console.log(chalk.gray('Building workflow...'));

  try {
    const result = await buildWorkflow(configPath);
    console.log(chalk.green(`\nWorkflow built successfully!`));
    console.log(`Output: ${chalk.cyan(result.outputPath)}`);
    console.log(`\nDouble-click the file to install in Alfred.`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`\nBuild failed: ${error.message}`));
    } else {
      console.error(chalk.red('\nBuild failed with unknown error'));
    }
    process.exit(1);
  }
}
