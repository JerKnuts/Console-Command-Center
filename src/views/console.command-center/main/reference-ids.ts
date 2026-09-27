export type ReferenceIdOption = {
  label: string;
  value: string;
  detail?: string;
  keywords?: string[];
};

export type ReferenceIdPicker = {
  title: string;
  buttonLabel: string;
  searchPlaceholder: string;
  options: ReferenceIdOption[];
};

// Keep these catalogs separate from the command definitions so the same data
// can later power a dedicated Reference ID Browser without duplicating IDs.
export const BOUNTY_FACTION_PICKER: ReferenceIdPicker = {
  title: 'Select Bounty Faction',
  buttonLabel: 'Choose Faction',
  searchPlaceholder: 'Search faction name or Form ID...',
  options: [
    { label: 'Crimson Fleet', value: '00010B30', detail: 'Bounty faction' },
    { label: 'Dazra Ship Services', value: '010973BF', detail: 'Shattered Space DLC bounty faction', keywords: ['dazra', 'vendor'] },
    { label: 'Ebbside Strikers', value: '0012DCA5', detail: 'Neon faction' },
    { label: 'Freestar Collective / Rangers', value: '000638E5', detail: 'Freestar bounty faction', keywords: ['freestar collective', 'freestar rangers'] },
    { label: "House Va'ruun", value: '002758C5', detail: 'Base-game bounty faction', keywords: ['varuun'] },
    { label: "House Va'ruun — Shattered Space", value: '0107BDB6', detail: 'Shattered Space DLC bounty faction', keywords: ['varuun', 'dazra'] },
    { label: 'Red Mile', value: '002B209D', detail: 'Red Mile bounty faction' },
    { label: 'Ryujin Industries', value: '0026FDEA', detail: 'Neon / Ryujin bounty faction', keywords: ['neon'] },
    { label: 'Trade Authority', value: '0022E53D', detail: 'Trade Authority bounty faction' },
    { label: 'UC SysDef', value: '00052ADC', detail: 'United Colonies SysDef bounty faction', keywords: ['united colonies', 'sysdef'] },
    { label: 'United Colonies / UC Vanguard', value: '0005BD93', detail: 'United Colonies bounty faction', keywords: ['united colonies', 'vanguard', 'uc'] },
    { label: 'Xenofresh Corporation', value: '0022892D', detail: 'Xenofresh bounty faction' },
  ],
};

export const CORE_COMPANION_PICKER: ReferenceIdPicker = {
  title: 'Select Core Companion',
  buttonLabel: 'Choose Companion',
  searchPlaceholder: 'Search companion name or Reference ID...',
  options: [
    { label: 'Sarah Morgan', value: '00005986', detail: 'Core affinity companion', keywords: ['sarah'] },
    { label: 'Barrett', value: '00005788', detail: 'Core affinity companion' },
    { label: 'Sam Coe', value: '0029D488', detail: 'Core affinity companion', keywords: ['sam'] },
    { label: 'Andreja', value: '000059A9', detail: 'Core affinity companion' },
  ],
};


export const WEATHER_PICKER: ReferenceIdPicker = {
  title: 'Select Weather',
  buttonLabel: 'Choose Weather',
  searchPlaceholder: 'Search weather name or Form ID...',
  options: [
    { label: 'Clear', value: '0002B07E', detail: 'Clear weather' },
    { label: 'Rain', value: '000C3048', detail: 'Rain weather' },
    { label: 'Snow', value: '000C304C', detail: 'Snow weather' },
    { label: 'Heavy Snow', value: '000C304D', detail: 'Heavy snow weather', keywords: ['blizzard'] },
    { label: 'Thunderstorm', value: '000C304E', detail: 'Thunderstorm weather', keywords: ['storm', 'lightning'] },
    { label: 'Sandstorm', value: '000E8325', detail: 'Sandstorm weather', keywords: ['sand', 'storm'] },
    { label: 'Dense Mist', value: '0002B084', detail: 'Dense mist weather', keywords: ['fog'] },
    { label: 'Light Mist', value: '0002B087', detail: 'Light mist weather', keywords: ['fog'] },
    { label: 'Burning Haze', value: '000405FB', detail: 'Burning haze weather', keywords: ['haze'] },
  ],
};
