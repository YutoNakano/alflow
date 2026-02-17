# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

alflow is a CLI tool that generates Alfred workflows (.alfredworkflow files) from YAML configuration. It scaffolds workflow projects with script templates and compiles them into installable Alfred workflow archives.

## Commands

- `npm run build` — compile TypeScript to `dist/`
- `npm run dev` — compile in watch mode
- `npm test` — run tests with vitest

## Architecture

The CLI (`src/index.ts`) uses Commander with three subcommands:

- **`wizard`** (`src/commands/wizard.ts`) — interactive prompts (via @inquirer/prompts) that scaffold a new workflow project directory containing `workflow.yaml` and script templates in `scripts/`
- **`build`** (`src/commands/build.ts`) — reads `workflow.yaml`, loads referenced scripts from `scripts/`, generates an `info.plist`, and packages everything into a `.alfredworkflow` zip archive in `dist/`
- **`agent-prompt`** (`src/commands/agent-prompt.ts`) — outputs an AI prompt tailored to the workflow config, for generating Alfred Script Filter scripts

### Build Pipeline

`buildCommand` → `buildWorkflow` (workflow-builder) → `loadWorkflowConfig` (yaml-parser) → `generateInfoPlist` (plist-generator) → `createWorkflowArchive` (archive)

The workflow-builder orchestrates the build: it parses the YAML config, reads script files from disk, passes them to the plist generator which assembles Alfred workflow objects (trigger → script filter → action) with deterministic UUIDs, then archives everything into a zip.

### Key Design Decisions

- **Deterministic builds**: UUIDs are derived from `bundleId` + object role via SHA-256 (`src/utils/uuid.ts`). Archive entries use sorted order and fixed timestamps (epoch 0).
- **Workflow structure is a fixed 3-node chain**: trigger (keyword or hotkey) → script filter input → action (clipboard/paste/run-script). Connections are wired linearly.
- **Alfred object type constants and key codes** live in `src/schema/alfred-objects.ts`. The numeric values map to Alfred's internal plist representation.
- **Config validation** is manual runtime checking in `src/utils/yaml-parser.ts` (no Zod/JSON-schema). `ConfigValidationError` is the custom error class.

### Schema Layer

- `src/schema/workflow-config.ts` — TypeScript types for `workflow.yaml` structure (`WorkflowConfig`, `TriggerConfig`, `ActionConfig`, etc.) plus discriminated union type guards (`isKeywordTrigger`, `isScriptAction`)
- `src/schema/alfred-objects.ts` — Alfred plist constants (`ALFRED_OBJECT_TYPES`, `SCRIPT_LANGUAGE_TYPE`, `MODIFIER_KEYS`, `KEY_CODES`)

## TypeScript Conventions

- ESM throughout (`"type": "module"` in package.json, `NodeNext` module resolution)
- All local imports use `.js` extension (required by NodeNext)
- `as const` objects for enum-like mappings rather than TypeScript enums
