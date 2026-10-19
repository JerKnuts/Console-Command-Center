import { type SampleBatch } from './batch-library';
export { prepareSampleCommands } from './batch-library';

// The editable .txt files are the single source of the shipped defaults.
const files = import.meta.glob<string>('../../../../batches/included/*.txt', { query: '?raw', import: 'default', eager: true });
const PREVIOUS_NAMES: Record<string,string> = {'Boostpack Explosions':'More Boostpack Explosions','Boostpack Explosions RESET':'Reset Boostpack Explosions','Quick Surveying RESET':'Reset Quick Surveying','Scanner Visibility RESET':'Reset Scanner Visibility'};
export const SAMPLE_BATCHES: SampleBatch[] = Object.entries(files).map(([path, commands]) => {
  const name = path.slice(path.lastIndexOf('/') + 1, -4);
  const plugin = name === 'Spawn All Action Figures' ? 'SFBGS00D.esm' : name === 'Ammunition' && /0102C475/i.test(commands) ? 'ShatteredSpace.esm' : undefined;
  return { id: name, name, previousName: PREVIOUS_NAMES[name], commands, description: 'Load this editable file to review or run.', plugin,
    sourcePrefix: plugin === 'SFBGS00D.esm' ? '02' : plugin ? '01' : undefined };
}).sort((left, right) => left.name.localeCompare(right.name));
