import plist from 'plist';
import { generateDeterministicUuid } from '../utils/uuid.js';
import {
  ALFRED_OBJECT_TYPES,
  SCRIPT_LANGUAGE_TYPE,
  MODIFIER_KEYS,
  KEY_CODES,
  type WorkflowObject,
  type Connection,
  type UiData,
} from '../schema/alfred-objects.js';
import {
  type WorkflowConfig,
  type KeywordTrigger,
  type HotkeyTrigger,
  type ScriptFilterInput,
  type ScriptAction,
  ARGUMENT_TYPE_MAP,
  isKeywordTrigger,
  isHotkeyTrigger,
  isScriptAction,
} from '../schema/workflow-config.js';

interface PlistData {
  bundleid: string;
  name: string;
  version: string;
  createdby: string;
  description: string;
  category: string;
  webaddress: string;
  readme: string;
  disabled: boolean;
  objects: WorkflowObject[];
  connections: Record<string, Connection[]>;
  uidata: Record<string, UiData>;
}

export function generateInfoPlist(
  config: WorkflowConfig,
  scripts: Map<string, string>
): string {
  const objects: WorkflowObject[] = [];
  const connections: Record<string, Connection[]> = {};
  const uidata: Record<string, UiData> = {};

  let xPos = 150;
  const yPos = 50;
  const xStep = 300;

  // Create trigger object (Keyword or Hotkey)
  let triggerUid: string;
  if (isKeywordTrigger(config.trigger)) {
    triggerUid = createKeywordObject(config.bundleId, config.trigger, objects);
  } else {
    triggerUid = createHotkeyObject(config.bundleId, config.trigger, objects);
  }
  uidata[triggerUid] = { xpos: xPos, ypos: yPos };
  xPos += xStep;

  // Create Script Filter input
  const scriptContent = scripts.get(config.input.script);
  if (!scriptContent) {
    throw new Error(`Script not found: ${config.input.script}`);
  }
  const scriptFilterUid = createScriptFilterObject(
    config.bundleId,
    config.input,
    scriptContent,
    objects
  );
  uidata[scriptFilterUid] = { xpos: xPos, ypos: yPos };
  xPos += xStep;

  // Connect trigger to script filter
  connections[triggerUid] = [
    {
      destinationuid: scriptFilterUid,
      modifiers: 0,
      modifiersubtext: '',
      vitoclose: false,
    },
  ];

  // Create action object
  let actionUid: string;
  if (isScriptAction(config.action)) {
    const actionScriptContent = scripts.get(config.action.script);
    if (!actionScriptContent) {
      throw new Error(`Script not found: ${config.action.script}`);
    }
    actionUid = createRunScriptObject(
      config.bundleId,
      config.action,
      actionScriptContent,
      objects
    );
  } else {
    actionUid = createClipboardObject(
      config.bundleId,
      config.action.type === 'paste',
      objects
    );
  }
  uidata[actionUid] = { xpos: xPos, ypos: yPos };

  // Connect script filter to action
  connections[scriptFilterUid] = [
    {
      destinationuid: actionUid,
      modifiers: 0,
      modifiersubtext: '',
      vitoclose: false,
    },
  ];

  const plistData: PlistData = {
    bundleid: config.bundleId,
    name: config.name,
    version: config.version,
    createdby: config.author ?? '',
    description: config.description ?? '',
    category: config.category ?? 'Uncategorised',
    webaddress: config.website ?? '',
    readme: config.readme ?? '',
    disabled: false,
    objects,
    connections,
    uidata,
  };

  return plist.build(plistData as unknown as plist.PlistValue);
}

function createKeywordObject(
  bundleId: string,
  trigger: KeywordTrigger,
  objects: WorkflowObject[]
): string {
  const uid = generateDeterministicUuid(`${bundleId}-keyword`);
  objects.push({
    uid,
    type: ALFRED_OBJECT_TYPES.KEYWORD,
    version: 3,
    config: {
      keyword: trigger.keyword,
      text: trigger.title ?? '',
      subtext: trigger.subtitle ?? '',
      argumenttype: ARGUMENT_TYPE_MAP[trigger.withArgument ?? 'required'],
      withspace: true,
    },
  });
  return uid;
}

function createHotkeyObject(
  bundleId: string,
  trigger: HotkeyTrigger,
  objects: WorkflowObject[]
): string {
  const uid = generateDeterministicUuid(`${bundleId}-hotkey`);
  const modifierFlags = trigger.modifiers.reduce(
    (acc, mod) => acc | MODIFIER_KEYS[mod],
    0
  );
  const keyCode = KEY_CODES[trigger.key.toUpperCase()] ?? 0;

  objects.push({
    uid,
    type: ALFRED_OBJECT_TYPES.HOTKEY,
    version: 2,
    config: {
      hotkey: keyCode,
      hotmod: modifierFlags,
      action: 0,
      argument: 0,
      focusedappvariable: false,
      focusedappvariablename: '',
      hotstring: '',
      leftcursor: false,
      modsmode: 0,
      relatedApps: [],
      relatedAppsMode: 0,
    },
  });
  return uid;
}

function createScriptFilterObject(
  bundleId: string,
  input: ScriptFilterInput,
  scriptContent: string,
  objects: WorkflowObject[]
): string {
  const uid = generateDeterministicUuid(`${bundleId}-scriptfilter`);
  const langType = SCRIPT_LANGUAGE_TYPE[input.language];

  objects.push({
    uid,
    type: ALFRED_OBJECT_TYPES.SCRIPT_FILTER,
    version: 3,
    config: {
      alfredfiltersresults: input.alfredFiltersResults ?? false,
      alfredfiltersresultsmatchmode: 0,
      argumenttreatemptyqueryasnil: true,
      argumenttrimmode: 0,
      argumenttype: 0,
      escaping: 102,
      keyword: '',
      queuedelaycustom: 3,
      queuedelayimmediatelyalinitiallyempty: true,
      queuedelaymode: 0,
      queuemode: 1,
      runningsubtext: '',
      script: scriptContent,
      scriptargtype: 1,
      scriptfile: '',
      subtext: '',
      title: '',
      type: langType,
      withspace: true,
    },
  });
  return uid;
}

function createRunScriptObject(
  bundleId: string,
  action: ScriptAction,
  scriptContent: string,
  objects: WorkflowObject[]
): string {
  const uid = generateDeterministicUuid(`${bundleId}-runscript`);
  const langType = SCRIPT_LANGUAGE_TYPE[action.language];

  objects.push({
    uid,
    type: ALFRED_OBJECT_TYPES.RUN_SCRIPT,
    version: 3,
    config: {
      concurrently: false,
      escaping: 102,
      script: scriptContent,
      scriptargtype: 1,
      scriptfile: '',
      type: langType,
    },
  });
  return uid;
}

function createClipboardObject(
  bundleId: string,
  autoPaste: boolean,
  objects: WorkflowObject[]
): string {
  const uid = generateDeterministicUuid(`${bundleId}-clipboard`);

  objects.push({
    uid,
    type: ALFRED_OBJECT_TYPES.CLIPBOARD,
    version: 3,
    config: {
      clipboardtext: '{query}',
      autopaste: autoPaste,
      transient: false,
    },
  });
  return uid;
}
