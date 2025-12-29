export type WorkflowCategory =
  | 'Internet'
  | 'Productivity'
  | 'Tools'
  | 'Uncategorised';

export type ArgumentType = 'required' | 'optional' | 'none';

export type ScriptLanguage = 'python' | 'javascript' | 'bash';

export interface KeywordTrigger {
  type: 'keyword';
  keyword: string;
  title?: string;
  subtitle?: string;
  withArgument?: ArgumentType;
}

export interface HotkeyTrigger {
  type: 'hotkey';
  key: string;
  modifiers: ('cmd' | 'alt' | 'ctrl' | 'shift')[];
}

export type TriggerConfig = KeywordTrigger | HotkeyTrigger;

export interface ScriptFilterInput {
  type: 'script-filter';
  script: string;
  language: ScriptLanguage;
  alfredFiltersResults?: boolean;
}

export type InputConfig = ScriptFilterInput;

export interface ClipboardAction {
  type: 'clipboard';
}

export interface PasteAction {
  type: 'paste';
}

export interface ScriptAction {
  type: 'script';
  script: string;
  language: ScriptLanguage;
}

export type ActionConfig = ClipboardAction | PasteAction | ScriptAction;

export interface WorkflowConfig {
  name: string;
  bundleId: string;
  version: string;
  description?: string;
  category?: WorkflowCategory;
  author?: string;
  website?: string;
  readme?: string;
  trigger: TriggerConfig;
  input: InputConfig;
  action: ActionConfig;
}

export const ARGUMENT_TYPE_MAP: Record<ArgumentType, number> = {
  required: 0,
  optional: 1,
  none: 2,
};

export function isKeywordTrigger(trigger: TriggerConfig): trigger is KeywordTrigger {
  return trigger.type === 'keyword';
}

export function isHotkeyTrigger(trigger: TriggerConfig): trigger is HotkeyTrigger {
  return trigger.type === 'hotkey';
}

export function isScriptAction(action: ActionConfig): action is ScriptAction {
  return action.type === 'script';
}
