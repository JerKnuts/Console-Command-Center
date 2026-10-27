import type { CommandDefinition, CommandInput } from './commands';
import { CORE_COMPANION_PICKER, REFERENCE_ACTOR_VALUE_PICKER } from './reference-ids.ts';

// Keep existing IDs so saved Favorites and feedback still match.
const target = (): CommandInput => ({
  key: 'target', label: 'Target', type: 'text', defaultValue: 'player',
  pattern: '^(?:[pP][lL][aA][yY][eE][rR]|[0-9A-Fa-f]{1,8})$',
  hint: 'Choose Player or a companion, or enter a placed Reference ID. Do not include a period or use an item Base ID.',
  picker: {
    title: 'Choose Target', buttonLabel: 'Choose Target', searchPlaceholder: 'Search player or companion...',
    options: [
      { label: 'Player', value: 'player', detail: 'Your character' },
      ...CORE_COMPANION_PICKER.options.map(option => ({ ...option, detail: 'Companion Reference ID; the actor must be available in the current session' })),
    ],
  },
});

const readout = (id: string, title: string, category: CommandDefinition['category'], description: string,
  command: string, inputs?: CommandInput[]): CommandDefinition => ({
  id, title, category, description, command, inputs,
  tags: [command.replace('{target}.', '').split(' ')[0], 'readout', 'query'],
  captureOutput: true, testStatus: 'untested',
});

const READOUT_COMMANDS: CommandDefinition[] = [
  readout('engine-getsfseversion-65', 'Get SFSE Version', 'Advanced Settings',
    'Show the installed Starfield Script Extender version. Requires the game to be launched with SFSE.', 'GetSFSEVersion'),
  readout('engine-getcurrentcell-507', 'Get Current Cell', 'World',
    'Show the name and Form ID of the cell containing the camera.', 'GetCurrentCell'),
  readout('engine-getlevel-627', 'Get Level', 'Player',
    'Read the level of the chosen actor. Choose Player to read your character’s level.', '{target}.GetLevel', [target()]),
  readout('engine-getscale-571', 'Get Scale', 'Targets',
    'Read the chosen reference’s size multiplier. A value of 1 means its normal size.', '{target}.GetScale', [target()]),
  readout('engine-getdead-593', 'Are They Dead?', 'Targets',
    'Check whether the chosen actor is dead. Returns 1 for dead or 0 for alive.', '{target}.GetDead', [target()]),
  readout('engine-getdisabled-582', 'Are They Disabled?', 'Targets',
    'Check whether the chosen reference is disabled. Returns 1 for disabled or 0 for enabled.', '{target}.GetDisabled', [target()]),
  readout('engine-getsleeping-596', 'Are They Sleeping?', 'Targets',
    'Read the chosen actor’s numeric sleep state. Choose Player or another actor to inspect.', '{target}.GetSleeping', [target()]),
  readout('engine-getitemcount-594', 'Get Item Count', 'Inventory',
    'Count a particular item in the chosen target’s inventory. Choose an item or enter its Base Form ID.', '{target}.GetItemCount {arguments}', [
      target(), {
        key: 'arguments', label: 'Item Form ID', type: 'text', pattern: '^[0-9A-Fa-f]{1,8}$',
        placeholder: 'Choose an item', hint: 'Use the item’s Base Form ID, not a placed Reference ID.',
        browserPicker: { browser: 'id', buttonLabel: 'Browse Items', allowedTypes: ['WEAP', 'ARMO', 'AMMO', 'ALCH', 'MISC', 'BOOK', 'NOTE', 'KEYM', 'INGR'] },
      },
    ]),
  readout('engine-getgold-595', 'Get Credit Count', 'Inventory',
    'Read how many credits the chosen target has.', '{target}.GetGold', [target()]),
  readout('engine-getvalue-getav-561', 'Get Value', 'Player',
    'Read an actor value, such as health or carry weight, from the chosen target. Choose a value or enter its exact name.', '{target}.GetValue {arguments}', [
      target(), {
        key: 'arguments', label: 'Actor Value', type: 'text', defaultValue: 'Health', pattern: '^[A-Za-z0-9_]{1,64}$',
        hint: 'Choose an actor value or enter its name, such as Health or CarryWeight.', picker: REFERENCE_ACTOR_VALUE_PICKER,
      },
    ]),
  readout('engine-israining-609', 'Is It Raining?', 'World',
    'The game’s IsRaining command returns 0 regardless of weather in Starfield 1.16.244. It cannot reliably tell whether it is raining.', 'IsRaining'),
  readout('engine-issnowing-622', 'Is It Snowing?', 'World',
    'The game’s IsSnowing command returns 0 regardless of weather in Starfield 1.16.244. It cannot reliably tell whether it is snowing.', 'IsSnowing'),
  readout('engine-getrandompercent-624', 'Get Random Percent', 'Gameplay',
    'Generate a random percentage using the game’s random generator. The result can include decimals, and each run produces a new value. No target or arguments are needed.', 'GetRandomPercent'),
  readout('engine-getstartingpos-557', 'Get Starting Position', 'Targets',
    'Read the chosen reference’s starting coordinate on the X, Y, or Z axis. This reads its starting position rather than its current position.', '{target}.GetStartingPos {arguments}', [
      target(), {
        key: 'arguments', label: 'Axis', type: 'text', defaultValue: 'x', pattern: '^[xXyYzZ]$', hint: 'Choose X, Y, or Z.',
        picker: {
          title: 'Choose Axis', buttonLabel: 'Choose Axis', searchPlaceholder: 'Search X, Y, or Z...',
          options: [{ label: 'X', value: 'x' }, { label: 'Y', value: 'y' }, { label: 'Z (Height)', value: 'z' }],
        },
      },
    ]),
  readout('engine-getglobalvalue-621', 'Get Global Value', 'World',
    'Read the current value of a global variable. Choose a time or calendar value, or enter another Global Form ID.', 'GetGlobalValue {arguments}', [{
      key: 'arguments', label: 'Global Variable', type: 'text', defaultValue: '00000038', pattern: '^[0-9A-Fa-f]{1,8}$',
      hint: 'Choose a global variable or enter its GLOB Form ID.',
      picker: {
        title: 'Choose Global Variable', buttonLabel: 'Choose Global', searchPlaceholder: 'Search hour, time scale, day, month, year...',
        options: [
          { label: 'Game Hour', value: '00000038', detail: 'Current in-game hour', keywords: ['GameHour'] },
          { label: 'Time Scale', value: '0000003A', detail: 'Game-time speed multiplier', keywords: ['TimeScale'] },
          { label: 'Days Passed', value: '00000039', detail: 'Elapsed game days', keywords: ['GameDaysPassed'] },
          { label: 'Day', value: '00000037', detail: 'Current calendar day', keywords: ['GameDay'] },
          { label: 'Month', value: '00000036', detail: 'Current calendar month', keywords: ['GameMonth'] },
          { label: 'Year', value: '00000035', detail: 'Current calendar year', keywords: ['GameYear'] },
        ],
      },
    }]),
];


const actorQueries: [string,string,string,string][] = [
  ['engine-isweaponout-810','Is Weapon Out?','IsWeaponOut','Read whether the chosen actor has a weapon or fists drawn: 0 means holstered, 1 means fists, and 2 means a weapon.'],
  ['engine-isweaponmagicout-648','Is Magic Out?','IsWeaponMagicOut','Check whether the chosen actor is drawing or has drawn a weapon or magic. This combined engine check does not distinguish magic from weapons. Returns 1 for yes or 0 for no.'],
  ['engine-issneaking-833','Are They Sneaking?','IsSneaking','Check whether the chosen actor is sneaking. Returns 1 for yes or 0 for no.'],
  ['engine-isrunning-834','Are They Running?','IsRunning','Check whether the chosen actor is running. Returns 1 for yes or 0 for no. Opening a menu or pausing can change the movement state.'],
  ['engine-isincombat-836','Are They In Combat?','IsInCombat','Check whether the chosen actor is in combat. Returns 1 for yes or 0 for no.'],
  ['engine-getcombatstate-870','Combat State','GetCombatState','Read the chosen actor’s numeric combat state.'],
  ['engine-isessential-901','Are They Essential?','IsEssential','Check whether the chosen actor is marked essential. Returns 1 for yes or 0 for no.'],
];
const placedTarget = (): CommandInput => ({
  key: 'target', label: 'Object Reference ID', type: 'text', pattern: '^[0-9A-Fa-f]{1,8}$',
  placeholder: 'Placed door or container Reference ID',
  hint: 'Click the door or container in the game console and copy its placed Reference ID here. Do not use its Base Form ID.',
});
READOUT_COMMANDS.push(
  ...actorQueries.map(([id,title,verb,description])=>readout(id,title,'Targets',description,'{target}.'+verb,[target()])),
  readout('engine-getdistance-548','How Far Away Is It?','Targets',
    'Measure the straight-line distance from the chosen source to another placed reference in game units. The source defaults to Player. The popup supports references in the same cell.',
    '{target}.GetDistance {arguments}',[target(),{
      ...target(), key:'arguments',label:'Destination Reference ID', defaultValue:'00005986',
      hint:'Choose a nearby companion or enter another placed Reference ID. The source and destination must be in the same cell.',
    }]),
  readout('engine-getlocked-552','Is It Locked?','Targets',
    'Read the chosen door or container’s lock state: 0 means unlocked, 1 means locked, and 2 means broken.',
    '{target}.GetLocked',[placedTarget()]),
  readout('engine-getlocklevel-612','How Hard Is The Lock?','Targets',
    'Read the numeric lock level of the chosen door or container. Enter its placed Reference ID.',
    '{target}.GetLockLevel',[placedTarget()]),
);
// Explicit placement requested in exported 1.3.47 and 1.3.48 feedback.
const miscReadoutIds = new Set([
  'engine-getrandompercent-624','engine-getitemcount-594','engine-getscale-571',
  'engine-getdead-593','engine-getdisabled-582','engine-getsleeping-596',
  ...actorQueries.map(([id])=>id),
  'engine-getdistance-548','engine-getlocked-552','engine-getlocklevel-612',
]);
export const CONFIRMED_READOUT_COMMANDS: CommandDefinition[] = READOUT_COMMANDS.map(command =>
  ['engine-getcurrentcell-507','engine-getstartingpos-557','engine-israining-609','engine-issnowing-622'].includes(command.id)
    ? {...command,category:'Untested',testStatus:'needs-adjustment',intakeGroup:'Executed — Issues'}
    : miscReadoutIds.has(command.id) ? {...command,category:'MISC'} : command);
