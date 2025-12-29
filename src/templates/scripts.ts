import type { ScriptLanguage } from '../schema/workflow-config.js';

export function getScriptTemplate(language: ScriptLanguage): string {
  switch (language) {
    case 'python':
      return PYTHON_TEMPLATE;
    case 'javascript':
      return JAVASCRIPT_TEMPLATE;
    case 'bash':
      return BASH_TEMPLATE;
  }
}

export function getScriptExtension(language: ScriptLanguage): string {
  switch (language) {
    case 'python':
      return 'py';
    case 'javascript':
      return 'js';
    case 'bash':
      return 'sh';
  }
}

const PYTHON_TEMPLATE = `#!/usr/bin/env python3
import json
import sys

def main():
    query = sys.argv[1] if len(sys.argv) > 1 else ""

    items = []

    if query:
        items.append({
            "title": f"You searched for: {query}",
            "subtitle": "Press Enter to copy",
            "arg": query,
            "valid": True
        })
    else:
        items.append({
            "title": "Type something to search",
            "subtitle": "Start typing...",
            "valid": False
        })

    print(json.dumps({"items": items}))

if __name__ == "__main__":
    main()
`;

const JAVASCRIPT_TEMPLATE = `#!/usr/bin/env osascript -l JavaScript

function run(argv) {
    const query = argv[0] || "";

    const items = [];

    if (query) {
        items.push({
            title: \`You searched for: \${query}\`,
            subtitle: "Press Enter to copy",
            arg: query,
            valid: true
        });
    } else {
        items.push({
            title: "Type something to search",
            subtitle: "Start typing...",
            valid: false
        });
    }

    return JSON.stringify({ items });
}
`;

const BASH_TEMPLATE = `#!/bin/bash

query="$1"

if [ -n "$query" ]; then
    cat << EOF
{
  "items": [
    {
      "title": "You searched for: $query",
      "subtitle": "Press Enter to copy",
      "arg": "$query",
      "valid": true
    }
  ]
}
EOF
else
    cat << EOF
{
  "items": [
    {
      "title": "Type something to search",
      "subtitle": "Start typing...",
      "valid": false
    }
  ]
}
EOF
fi
`;
