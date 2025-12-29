#!/usr/bin/env node

import { Command } from 'commander';
import { wizardCommand } from './commands/wizard.js';
import { agentPromptCommand } from './commands/agent-prompt.js';
import { buildCommand } from './commands/build.js';

const program = new Command();

program
  .name('alfred-gen')
  .description('Generate Alfred workflows programmatically')
  .version('1.0.0');

program
  .command('wizard')
  .description('Interactive CLI to create a new workflow')
  .action(wizardCommand);

program
  .command('agent-prompt')
  .description('Output AI prompt for script generation')
  .option('-c, --config <path>', 'Path to workflow.yaml')
  .action(agentPromptCommand);

program
  .command('build')
  .description('Build .alfredworkflow from workflow.yaml')
  .option('-c, --config <path>', 'Path to workflow.yaml')
  .action(buildCommand);

program.parse();
