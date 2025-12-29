export const ALFRED_OBJECT_TYPES = {
  KEYWORD: 'alfred.workflow.input.keyword',
  SCRIPT_FILTER: 'alfred.workflow.input.scriptfilter',
  HOTKEY: 'alfred.workflow.trigger.hotkey',
  RUN_SCRIPT: 'alfred.workflow.action.script',
  CLIPBOARD: 'alfred.workflow.output.clipboard',
  NOTIFICATION: 'alfred.workflow.output.notification',
} as const;

export type AlfredObjectType = typeof ALFRED_OBJECT_TYPES[keyof typeof ALFRED_OBJECT_TYPES];

export const SCRIPT_LANGUAGE_TYPE = {
  bash: 0,
  zsh: 1,
  php: 2,
  python: 3,
  perl: 4,
  ruby: 5,
  applescript: 6,
  javascript: 7,
} as const;

export type ScriptLanguageKey = keyof typeof SCRIPT_LANGUAGE_TYPE;

export const MODIFIER_KEYS = {
  cmd: 1048576,
  alt: 524288,
  ctrl: 262144,
  shift: 131072,
} as const;

export type ModifierKey = keyof typeof MODIFIER_KEYS;

export const KEY_CODES: Record<string, number> = {
  A: 0, S: 1, D: 2, F: 3, H: 4, G: 5, Z: 6, X: 7, C: 8, V: 9,
  B: 11, Q: 12, W: 13, E: 14, R: 15, Y: 16, T: 17, '1': 18, '2': 19,
  '3': 20, '4': 21, '6': 22, '5': 23, '=': 24, '9': 25, '7': 26,
  '-': 27, '8': 28, '0': 29, ']': 30, O: 31, U: 32, '[': 33, I: 34,
  P: 35, L: 37, J: 38, "'": 39, K: 40, ';': 41, '\\': 42, ',': 43,
  '/': 44, N: 45, M: 46, '.': 47, '`': 50, SPACE: 49, RETURN: 36,
  TAB: 48, DELETE: 51, ESCAPE: 53, F1: 122, F2: 120, F3: 99, F4: 118,
  F5: 96, F6: 97, F7: 98, F8: 100, F9: 101, F10: 109, F11: 103, F12: 111,
};

export interface WorkflowObject {
  uid: string;
  type: AlfredObjectType;
  version: number;
  config: Record<string, unknown>;
}

export interface Connection {
  destinationuid: string;
  modifiers: number;
  modifiersubtext: string;
  vitoclose: boolean;
}

export interface UiData {
  xpos: number;
  ypos: number;
}
