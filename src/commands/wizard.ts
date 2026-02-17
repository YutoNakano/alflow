import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { input, select, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { stringify } from 'yaml';
import { getScriptTemplate, getScriptExtension } from '../templates/scripts.js';
import { assertSafeScriptPath } from '../utils/path-validation.js';
import type {
  WorkflowConfig,
  TriggerConfig,
  InputConfig,
  ActionConfig,
  ScriptLanguage,
  WorkflowCategory,
  ArgumentType,
} from '../schema/workflow-config.js';

export interface CollectedWorkflow {
  config: WorkflowConfig;
  scripts: Map<string, string>;
}

export async function collectWorkflowConfig(): Promise<CollectedWorkflow> {
  console.log(chalk.bold('\nAlfred Workflow Generator\n'));

  // Collect workflow metadata
  const name = await input({
    message: 'Workflow name:',
    validate: (value) => (value.trim() ? true : 'Name is required'),
  });

  const bundleId = await input({
    message: 'Bundle ID:',
    default: `com.example.${name.toLowerCase().replace(/\s+/g, '-')}`,
    validate: (value) => (value.trim() ? true : 'Bundle ID is required'),
  });

  const category = await select<WorkflowCategory>({
    message: 'Category:',
    choices: [
      { name: 'Productivity', value: 'Productivity' },
      { name: 'Internet', value: 'Internet' },
      { name: 'Tools', value: 'Tools' },
      { name: 'Uncategorised', value: 'Uncategorised' },
    ],
  });

  const description = await input({
    message: 'Description (optional):',
  });

  // Collect trigger configuration
  const triggerType = await select<'keyword' | 'hotkey'>({
    message: 'Trigger type:',
    choices: [
      { name: 'Keyword', value: 'keyword' },
      { name: 'Hotkey', value: 'hotkey' },
    ],
  });

  let trigger: TriggerConfig;
  if (triggerType === 'keyword') {
    const keyword = await input({
      message: 'Keyword:',
      validate: (value) => (value.trim() ? true : 'Keyword is required'),
    });

    const title = await input({
      message: 'Title (shown in Alfred):',
      default: name,
    });

    const withArgument = await select<ArgumentType>({
      message: 'Argument:',
      choices: [
        { name: 'Required', value: 'required' },
        { name: 'Optional', value: 'optional' },
        { name: 'None', value: 'none' },
      ],
    });

    trigger = {
      type: 'keyword',
      keyword,
      title,
      withArgument,
    };
  } else {
    const key = await input({
      message: 'Hotkey key (e.g., M, F1):',
      validate: (value) => (value.trim() ? true : 'Key is required'),
    });

    const modifiers = await select<('cmd' | 'alt' | 'ctrl' | 'shift')[]>({
      message: 'Modifiers:',
      choices: [
        { name: 'Cmd + Shift', value: ['cmd', 'shift'] },
        { name: 'Cmd + Alt', value: ['cmd', 'alt'] },
        { name: 'Cmd + Ctrl', value: ['cmd', 'ctrl'] },
        { name: 'Ctrl + Shift', value: ['ctrl', 'shift'] },
      ],
    });

    trigger = {
      type: 'hotkey',
      key: key.toUpperCase(),
      modifiers,
    };
  }

  // Collect input configuration
  const language = await select<ScriptLanguage>({
    message: 'Script language:',
    choices: [
      { name: 'Python', value: 'python' },
      { name: 'JavaScript (osascript)', value: 'javascript' },
      { name: 'Bash', value: 'bash' },
    ],
  });

  const alfredFiltersResults = await confirm({
    message: 'Let Alfred filter results?',
    default: false,
  });

  const scriptName = `search.${getScriptExtension(language)}`;
  const inputConfig: InputConfig = {
    type: 'script-filter',
    script: scriptName,
    language,
    alfredFiltersResults,
  };

  // Collect action configuration
  const actionType = await select<'clipboard' | 'paste' | 'script'>({
    message: 'Action on Enter:',
    choices: [
      { name: 'Copy to clipboard', value: 'clipboard' },
      { name: 'Paste to frontmost app', value: 'paste' },
      { name: 'Run another script', value: 'script' },
    ],
  });

  let action: ActionConfig;
  if (actionType === 'script') {
    const actionLanguage = await select<ScriptLanguage>({
      message: 'Action script language:',
      choices: [
        { name: 'Python', value: 'python' },
        { name: 'JavaScript (osascript)', value: 'javascript' },
        { name: 'Bash', value: 'bash' },
      ],
    });

    const actionScriptName = `action.${getScriptExtension(actionLanguage)}`;
    action = {
      type: 'script',
      script: actionScriptName,
      language: actionLanguage,
    };
  } else {
    action = { type: actionType };
  }

  // Build config object
  const config: WorkflowConfig = {
    name,
    bundleId,
    version: '1.0.0',
    category,
    trigger,
    input: inputConfig,
    action,
  };

  if (description) {
    config.description = description;
  }

  // Build scripts map from templates
  const scripts = new Map<string, string>();
  scripts.set(scriptName, getScriptTemplate(language));

  if (action.type === 'script') {
    scripts.set(action.script, getScriptTemplate(action.language));
  }

  return { config, scripts };
}

export async function writeProjectFiles(
  projectDir: string,
  config: WorkflowConfig,
  scripts: Map<string, string>,
): Promise<void> {
  const scriptsDir = join(projectDir, 'scripts');
  await mkdir(scriptsDir, { recursive: true });

  // Write workflow.yaml
  const yamlContent = stringify(config);
  await writeFile(join(projectDir, 'workflow.yaml'), yamlContent);

  // Write script files
  for (const [name, content] of scripts) {
    assertSafeScriptPath(name);
    await writeFile(join(scriptsDir, name), content);
  }
}
