import type { CommandDefinition } from './commands';

const referenceInput = (key: string, label: string) => ({
  key, label, type: 'text' as const, defaultValue: key === 'target' ? 'player' : undefined,
  pattern: key === 'target' ? '^(?:[pP][lL][aA][yY][eE][rR]|[0-9A-Fa-f]{1,8})$' : '^[0-9A-Fa-f]{1,8}$',
  hint: key === 'target' ? 'Enter player or a placed Reference ID.' : 'Choose an item or enter its Base Form ID.',
});

export const PAPYRUS_INSPECTION_SPECS = {
  scale: { method: 'ObjectReference.GetScale', argument: 'target' },
  sleepState: { method: 'Actor.GetSleepState', argument: 'target' },
  combatState: { method: 'Actor.GetCombatState', argument: 'target' },
  itemCount: { method: 'ObjectReference.GetItemCount', argument: 'item' },
  actorOwner: { method: 'ObjectReference.GetActorRefOwner', argument: 'target' },
  hasActorOwner: { method: 'ObjectReference.HasActorRefOwner', argument: 'target' },
  crewAssignment: { method: 'Actor.GetCrewAssignment', argument: 'target' },
  followers: { method: 'Game.GetPlayerFollowers', argument: 'none' },
  activeQuests: { method: 'Game.GetPlayerActiveQuests', argument: 'none' },
  pluginInstalled: { method: 'Game.IsPluginInstalled', argument: 'plugin' },
} as const;

export type PapyrusInspectionOperation = keyof typeof PAPYRUS_INSPECTION_SPECS;

export function papyrusInspectionRequest(operation: PapyrusInspectionOperation, command: string): {
  operation: PapyrusInspectionOperation; target?: string; item?: string; plugin?: string;
} {
  const spec = PAPYRUS_INSPECTION_SPECS[operation];
  if (!spec) throw new Error('Unknown Papyrus inspection.');
  if (spec.argument === 'plugin') {
    const prefix = spec.method + ' ';
    const plugin = command.trim().startsWith(prefix) ? command.trim().slice(prefix.length).trim() : '';
    if (!/^[^<>:"/\\|?*\x00-\x1F]{1,250}\.(?:esm|esp|esl)$/i.test(plugin) || plugin.length > 255) {
      throw new Error('Enter the plugin filename, including .esm, .esp or .esl.');
    }
    return { operation, plugin };
  }
  const tokens = command.trim().split(/\s+/);
  const counts = { target: 2, item: 3, none: 1 };
  if (tokens[0] !== spec.method || tokens.length !== counts[spec.argument]) {
    throw new Error('Complete the inspection fields before continuing.');
  }
  if (spec.argument === 'none') return { operation };
  if (!/^(?:player|[0-9A-Fa-f]{1,8})$/i.test(tokens[1])) throw new Error('Enter player or a placed Reference ID.');
  const request = { operation, target: tokens[1] };
  if (spec.argument === 'target') return request;
  if (!/^[0-9A-Fa-f]{1,8}$/.test(tokens[2])) throw new Error('Enter the item Base Form ID.');
  return { ...request, item: tokens[2] };
}

function inspection(operation: PapyrusInspectionOperation, title: string, description: string): CommandDefinition {
  const spec = PAPYRUS_INSPECTION_SPECS[operation];
  const inputs: NonNullable<CommandDefinition['inputs']> = [];
  let command = String(spec.method);
  if (spec.argument === 'target' || spec.argument === 'item') {
    inputs.push(referenceInput('target', 'Target Reference'));
    command += ' {target}';
  }
  if (spec.argument === 'item') {
    inputs.push({ ...referenceInput('item', 'Item Base Form ID'), browserPicker: {
      browser: 'id', buttonLabel: 'Browse Items', allowedTypes: ['WEAP', 'ARMO', 'AMMO', 'ALCH', 'MISC', 'BOOK', 'NOTE', 'KEYM', 'INGR'],
    } });
    command += ' {item}';
  }
  if (spec.argument === 'plugin') {
    inputs.push({ key: 'plugin', label: 'Plugin Filename', type: 'text', placeholder: 'Starfield.esm',
      pattern: '^[^<>:"/\\\\|?*\\x00-\\x1F]{1,250}\\.(?:[eE][sS][mMlL]|[eE][sS][pP])$',
      hint: 'Exact plugin filename, including its extension. Spaces are supported.',
    });
    command += ' {plugin}';
  }
  return { id: `papyrus-${operation}`, title: `${title} (Papyrus)`, category: 'Untested',
    description: `${description} Reads through Starfield’s scripting interface. Requires in-game verification.`,
    command, inputs, inspection: operation, captureOutput: true, executeLabel: 'Inspect',
    testStatus: 'untested', intakeGroup: 'Script Functions', tags: ['papyrus', 'inspection', 'readout', operation],
  };
}

export const PAPYRUS_INSPECTIONS: CommandDefinition[] = [
  inspection('scale', 'Inspect Reference Scale', 'Read the chosen reference’s scale multiplier.'),
  inspection('sleepState', 'Inspect Sleep State', 'Read an actor’s sleep state. 0 means awake, 2 wants to sleep, 3 sleeping, and 4 wants to wake.'),
  inspection('combatState', 'Inspect Combat State', 'Read the chosen actor’s numeric combat state.'),
  inspection('itemCount', 'Inspect Item Count', 'Count a selected item in the target’s inventory.'),
  inspection('actorOwner', 'Inspect Actor Owner', 'Show the actor reference that owns this object, or None.'),
  inspection('hasActorOwner', 'Inspect Actor Owner Flag', 'Check whether an actor owner was assigned, including a temporary owner that may no longer exist.'),
  inspection('crewAssignment', 'Inspect Crew Assignment', 'Show the chosen actor’s assigned reference, or None.'),
  inspection('followers', 'Inspect Current Followers', 'List actors currently following the player.'),
  inspection('activeQuests', 'Inspect Active Quests', 'List the player’s active quest records.'),
  inspection('pluginInstalled', 'Inspect Plugin Installation', 'Ask the game whether the specified plugin is installed.'),
];
