import type { CommandCategory, CommandDefinition } from './commands';

export function wipCommandOutcome(command: CommandDefinition): 'issues' | 'uncertain' | undefined {
  if (command.category !== 'Untested') return undefined;
  if (command.intakeGroup === 'Executed — Effect Unconfirmed') return 'uncertain';
  if (command.intakeGroup === 'Executed — Issues' || command.intakeGroup === 'Blocked — Known Crash') return 'issues';
  return undefined;
}

export function workingCommandCategory(command: CommandDefinition): CommandCategory {
  if (command.category !== 'Untested') return command.category;
  const name = command.command.replace(/^\{[^}]+\}\.|^player\.|^[a-f\d]{8}\./i, '').split(/[\s{]/)[0].toLowerCase();
  if (/^(?:help|togglemenus|showsubtitle|toggle(?:godmode|immortalmode|gamepause)|setdifficulty|setgamesetting|setini)/.test(name)) return 'Gameplay';
  if (/quest|^(?:getstage|setstage|sqs|sqt)$|objectivedisplay/.test(name)) return 'Quests';
  if (/^(?:pick|getselectedref|islastref)|selectedref/.test(name)) return 'Targets';
  if (/perk|skill|experience|addspell|removespell|hasspell|wordofpower|shout/.test(name)) return 'Skills';
  if (/ship|vehicle|flight|gravjump/.test(name)) return 'Ship';
  if (/item|inventory|equip|unequip|container|addammo|removeammo/.test(name)) return 'Inventory';
  if (/camera|flycam|fov|screenshot|wireframe|scenegraph|image|lighting|characterlight|motionblur|render|depthoffield|firstperson|thirdperson/.test(name)) return 'Camera';
  if (/sexchange|showlooksmenu|player|level|actorvalue|advlevel|health|stamina|oxygen|carryweight/.test(name) || /^player\./i.test(command.command)) return 'Player';
  if (/kill|resurrect|disable|enable|actor|reference|setpos|getpos|setangle|getangle|scale|moveto|placeatme|lock|unlock|combat|faction|av$/.test(name)) return 'Targets';
  return 'World';
}

// Project local reports onto immutable definitions. Changing a result can undo
// promotion; reports never remove a native safety block or another user's data.
export function applyCommandFeedback(command: CommandDefinition, outcome?: string): CommandDefinition {
  if (!outcome) return command;
  if (command.unavailableReason) return command;
  if (outcome === 'working') return { ...command, category: workingCommandCategory(command), testStatus: 'verified', intakeGroup: undefined };
  if (outcome === 'issues') return { ...command, category: 'Untested', testStatus: 'needs-adjustment', intakeGroup: 'Executed — Issues' };
  if (outcome === 'uncertain') return { ...command, category: 'Untested', testStatus: 'inconclusive', intakeGroup: 'Executed — Effect Unconfirmed' };
  return command;
}
