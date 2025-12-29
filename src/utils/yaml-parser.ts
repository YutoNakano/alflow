import { readFile } from 'fs/promises';
import { parse } from 'yaml';
import type { WorkflowConfig } from '../schema/workflow-config.js';

export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

export async function loadWorkflowConfig(path: string): Promise<WorkflowConfig> {
  const content = await readFile(path, 'utf-8');
  const config = parse(content) as WorkflowConfig;
  validateConfig(config);
  return config;
}

function validateConfig(config: unknown): asserts config is WorkflowConfig {
  if (!config || typeof config !== 'object') {
    throw new ConfigValidationError('Configuration must be an object');
  }

  const cfg = config as Record<string, unknown>;

  if (!cfg.name || typeof cfg.name !== 'string') {
    throw new ConfigValidationError('Missing or invalid "name" field');
  }

  if (!cfg.bundleId || typeof cfg.bundleId !== 'string') {
    throw new ConfigValidationError('Missing or invalid "bundleId" field');
  }

  if (!cfg.version || typeof cfg.version !== 'string') {
    throw new ConfigValidationError('Missing or invalid "version" field');
  }

  if (!cfg.trigger || typeof cfg.trigger !== 'object') {
    throw new ConfigValidationError('Missing or invalid "trigger" field');
  }

  const trigger = cfg.trigger as Record<string, unknown>;
  if (!['keyword', 'hotkey'].includes(trigger.type as string)) {
    throw new ConfigValidationError('trigger.type must be "keyword" or "hotkey"');
  }

  if (trigger.type === 'keyword' && !trigger.keyword) {
    throw new ConfigValidationError('Keyword trigger requires "keyword" field');
  }

  if (trigger.type === 'hotkey') {
    if (!trigger.key) {
      throw new ConfigValidationError('Hotkey trigger requires "key" field');
    }
    if (!Array.isArray(trigger.modifiers) || trigger.modifiers.length === 0) {
      throw new ConfigValidationError('Hotkey trigger requires at least one modifier');
    }
  }

  if (!cfg.input || typeof cfg.input !== 'object') {
    throw new ConfigValidationError('Missing or invalid "input" field');
  }

  const input = cfg.input as Record<string, unknown>;
  if (input.type !== 'script-filter') {
    throw new ConfigValidationError('input.type must be "script-filter"');
  }

  if (!input.script || typeof input.script !== 'string') {
    throw new ConfigValidationError('input.script is required');
  }

  if (!['python', 'javascript', 'bash'].includes(input.language as string)) {
    throw new ConfigValidationError('input.language must be "python", "javascript", or "bash"');
  }

  if (!cfg.action || typeof cfg.action !== 'object') {
    throw new ConfigValidationError('Missing or invalid "action" field');
  }

  const action = cfg.action as Record<string, unknown>;
  if (!['clipboard', 'paste', 'script'].includes(action.type as string)) {
    throw new ConfigValidationError('action.type must be "clipboard", "paste", or "script"');
  }

  if (action.type === 'script') {
    if (!action.script || typeof action.script !== 'string') {
      throw new ConfigValidationError('Script action requires "script" field');
    }
    if (!['python', 'javascript', 'bash'].includes(action.language as string)) {
      throw new ConfigValidationError('action.language must be "python", "javascript", or "bash"');
    }
  }
}
