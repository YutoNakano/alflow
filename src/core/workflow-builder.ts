import { readFile, access } from 'fs/promises';
import { join, dirname } from 'path';
import { loadWorkflowConfig } from '../utils/yaml-parser.js';
import { generateInfoPlist } from './plist-generator.js';
import { createWorkflowArchive, type ArchiveEntry } from './archive.js';
import type { WorkflowConfig } from '../schema/workflow-config.js';
import { isScriptAction } from '../schema/workflow-config.js';

export interface BuildResult {
  outputPath: string;
  workflowName: string;
}

export async function buildWorkflow(configPath: string): Promise<BuildResult> {
  const config = await loadWorkflowConfig(configPath);
  const baseDir = dirname(configPath);
  const scriptsDir = join(baseDir, 'scripts');
  const distDir = join(baseDir, 'dist');

  // Load all required scripts
  const scripts = await loadScripts(scriptsDir, config);

  // Generate info.plist
  const infoPlist = generateInfoPlist(config, scripts);

  // Prepare archive entries
  const entries: ArchiveEntry[] = [
    { name: 'info.plist', content: infoPlist },
  ];

  // Check for icon
  const iconPath = join(baseDir, 'icon.png');
  try {
    await access(iconPath);
    const iconContent = await readFile(iconPath);
    entries.push({ name: 'icon.png', content: iconContent });
  } catch {
    // No icon file, skip
  }

  // Create workflow archive
  const sanitizedName = config.name.replace(/[^a-zA-Z0-9-_]/g, '');
  const outputPath = join(distDir, `${sanitizedName}.alfredworkflow`);
  await createWorkflowArchive(outputPath, entries);

  return {
    outputPath,
    workflowName: config.name,
  };
}

async function loadScripts(
  scriptsDir: string,
  config: WorkflowConfig
): Promise<Map<string, string>> {
  const scripts = new Map<string, string>();

  // Load input script
  const inputScriptPath = join(scriptsDir, config.input.script);
  const inputScript = await readFile(inputScriptPath, 'utf-8');
  scripts.set(config.input.script, inputScript);

  // Load action script if applicable
  if (isScriptAction(config.action)) {
    const actionScriptPath = join(scriptsDir, config.action.script);
    const actionScript = await readFile(actionScriptPath, 'utf-8');
    scripts.set(config.action.script, actionScript);
  }

  return scripts;
}
