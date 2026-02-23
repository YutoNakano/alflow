<p align="center">
  <img src="https://raw.githubusercontent.com/YutoNakano/alflow/main/docs/social-preview.png" alt="alflow" width="400" />
</p>

<h1 align="center">alflow</h1>

<p align="center">
  <strong>Generate Alfred workflows from YAML &mdash; with optional AI-powered scripts.</strong>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#commands">Commands</a> &bull;
  <a href="#workflow-yaml">Config Reference</a> &bull;
  <a href="#ai-script-generation">AI Generation</a>
</p>

---

alflow is a CLI that scaffolds [Alfred](https://www.alfredapp.com/) workflow projects from interactive prompts, optionally generates script filter code with AI, and compiles everything into installable `.alfredworkflow` archives.

## Quick Start

```bash
git clone https://github.com/YutoNakano/alflow.git
cd alflow
npm install
npm run build
npm install -g .

# Create a workflow (interactive prompts + optional AI script generation)
alflow create

# Double-click the generated .alfredworkflow to install
```

That's it. `alflow create` walks you through the setup, writes a project directory, and builds the `.alfredworkflow` file in one step.

<p align="center">
  <img src="https://raw.githubusercontent.com/YutoNakano/alflow/main/docs/demo.png" alt="alflow create demo" width="600" />
</p>

## Commands

### `alflow create`

Interactive workflow creation (default command). Prompts for:

- Workflow name, bundle ID, category
- Trigger type (keyword or hotkey)
- Script language (Python, JavaScript/JXA, Bash)
- Action on Enter (copy to clipboard, paste, or run a script)
- **Optional AI script generation** via OpenAI, Anthropic, or Gemini

Outputs a project directory with `workflow.yaml`, `scripts/`, and a ready-to-install `.alfredworkflow` file.

### `alflow build`

Rebuilds the `.alfredworkflow` archive from an existing project:

```bash
cd my-workflow
alflow build
```

### `alflow agent-prompt`

Outputs a tailored AI prompt based on your `workflow.yaml` config. Useful for generating or refining scripts with any LLM:

```bash
alflow agent-prompt | pbcopy
```

## Workflow YAML

The project directory contains a `workflow.yaml` that fully describes your workflow:

```yaml
name: GitHub Search
bundleId: com.example.github-search
version: 1.0.0
category: Internet

trigger:
  type: keyword
  keyword: gh
  title: Search GitHub
  withArgument: required

input:
  type: script-filter
  script: search.py
  language: python
  alfredFiltersResults: false

action:
  type: clipboard
```

Edit this file and run `alflow build` to recompile.

### Trigger types

**Keyword** &mdash; activated by typing a keyword in Alfred:

```yaml
trigger:
  type: keyword
  keyword: gh
  title: Search GitHub
  withArgument: required  # required | optional | none
```

**Hotkey** &mdash; activated by a keyboard shortcut:

```yaml
trigger:
  type: hotkey
  key: G
  modifiers: [cmd, shift]
```

### Action types

| Type | Description |
|------|-------------|
| `clipboard` | Copy the selected result to clipboard |
| `paste` | Paste the selected result into the frontmost app |
| `script` | Run another script with the result as input |

```yaml
# Script action example
action:
  type: script
  script: action.sh
  language: bash
```

## AI Script Generation

During `alflow create`, you can optionally generate the script filter code using AI. Supported providers:

| Provider | API Key Env Var |
|----------|----------------|
| OpenAI | `OPENAI_API_KEY` |
| Anthropic | `ANTHROPIC_API_KEY` |
| Gemini | `GEMINI_API_KEY` |

Set your API key as an environment variable or enter it when prompted.

## Project Structure

After running `alflow create`, you get:

```
my-workflow/
  workflow.yaml     # Workflow configuration
  scripts/
    search.py       # Script filter (your main logic)
  dist/
    MyWorkflow.alfredworkflow   # Installable archive
```

## Requirements

- Node.js >= 18
- [Alfred](https://www.alfredapp.com/) with Powerpack

## License

MIT
