import { join } from 'path';
import chalk from 'chalk';
import { loadWorkflowConfig } from '../utils/yaml-parser.js';
import type { WorkflowConfig, ScriptLanguage } from '../schema/workflow-config.js';
import { isKeywordTrigger, isScriptAction } from '../schema/workflow-config.js';

interface AgentPromptOptions {
  config?: string;
}

export async function agentPromptCommand(options: AgentPromptOptions): Promise<void> {
  const configPath = options.config ?? join(process.cwd(), 'workflow.yaml');

  let config: WorkflowConfig;
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

function generatePrompt(config: WorkflowConfig): string {
  const triggerDesc = isKeywordTrigger(config.trigger)
    ? `Keyword "${config.trigger.keyword}" with ${config.trigger.withArgument ?? 'required'} argument`
    : `Hotkey ${config.trigger.modifiers.join('+')}+${config.trigger.key}`;

  const actionDesc = isScriptAction(config.action)
    ? 'Run another script'
    : config.action.type === 'paste'
    ? 'Paste to frontmost application'
    : 'Copy to clipboard';

  const languageTemplates = getLanguageTemplates(config.input.language);

  return `You are generating a script for an Alfred workflow.

## Workflow Configuration
- Name: ${config.name}
- Trigger: ${triggerDesc}
- Script Language: ${config.input.language}
- Action on Enter: ${actionDesc}

## Your Task
Create a ${config.input.language} script that:
1. Reads the query from Alfred (passed as the first argument)
2. Processes the query and generates results
3. Outputs JSON in Alfred's Script Filter format

## Alfred Script Filter JSON Format
Your script must output JSON like this:
\`\`\`json
{
  "items": [
    {
      "title": "Result title",
      "subtitle": "Result description",
      "arg": "value passed to next action",
      "valid": true,
      "icon": { "path": "icon.png" }
    }
  ]
}
\`\`\`

### Item Properties
- \`title\` (required): Main text shown in Alfred
- \`subtitle\`: Secondary text shown below title
- \`arg\`: Value passed to the next workflow action (e.g., copied to clipboard)
- \`valid\`: If false, pressing Enter does nothing
- \`icon\`: Custom icon (\`{ "path": "icon.png" }\` or \`{ "type": "fileicon", "path": "/path/to/file" }\`)
- \`uid\`: Unique identifier for Alfred to learn from selections
- \`autocomplete\`: Text to insert when Tab is pressed

## Script Template (${config.input.language})
${languageTemplates.template}

## Requirements
- Handle empty queries gracefully (show helpful placeholder)
- Return valid JSON to stdout
- Exit with code 0 on success
- ${languageTemplates.requirements}

## File Location
Save your script to: \`scripts/${config.input.script}\`

---
Output code only, no explanation needed.`;
}

function getLanguageTemplates(language: ScriptLanguage): {
  template: string;
  requirements: string;
} {
  switch (language) {
    case 'python':
      return {
        template: `\`\`\`python
#!/usr/bin/env python3
import json
import sys

def main():
    query = sys.argv[1] if len(sys.argv) > 1 else ""

    items = []

    # Your logic here
    # Add items to the list based on query

    print(json.dumps({"items": items}))

if __name__ == "__main__":
    main()
\`\`\``,
        requirements: 'Use only standard library (no pip packages)',
      };

    case 'javascript':
      return {
        template: `\`\`\`javascript
#!/usr/bin/env osascript -l JavaScript

function run(argv) {
    const query = argv[0] || "";

    const items = [];

    // Your logic here
    // Add items to the array based on query

    return JSON.stringify({ items });
}
\`\`\``,
        requirements: 'Use JavaScript for Automation (JXA) compatible syntax',
      };

    case 'bash':
      return {
        template: `\`\`\`bash
#!/bin/bash

query="$1"

# Your logic here
# Build JSON output

cat << EOF
{
  "items": [
    {
      "title": "Result",
      "arg": "$query"
    }
  ]
}
EOF
\`\`\``,
        requirements: 'Use standard POSIX shell commands',
      };
  }
}
