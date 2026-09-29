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

export const PLAYER_ACTOR_VALUE_PICKER: ReferenceIdPicker = {
  title: 'Choose Player Actor Value',
  buttonLabel: 'Choose Value',
  searchPlaceholder: 'Search health, carry weight, speed, experience...',
  options: [
    { label: 'Health', value: 'Health', detail: 'Current health — inspection verified in game' },
    { label: 'Carry Weight', value: 'CarryWeight', detail: 'Carry capacity' },
    { label: 'Movement Speed', value: 'SpeedMult', detail: 'Movement speed multiplier' },
    { label: 'Experience', value: 'Experience', detail: 'Experience actor value' },
    { label: 'Star Power', value: 'starpower', detail: 'Current Starborn power resource' },
    { label: 'Star Power Recharge Rate', value: 'starpowerratemult', detail: 'Starborn power regeneration multiplier' },
  ],
};

export const REFERENCE_ACTOR_VALUE_PICKER: ReferenceIdPicker = {
  title: 'Choose Reference Actor Value',
  buttonLabel: 'Choose Value',
  searchPlaceholder: 'Search health, carry weight, speed, affinity...',
  options: [
    { label: 'Health', value: 'Health', detail: 'Current effective health value' },
    { label: 'Carry Weight', value: 'CarryWeight', detail: 'Current effective carry capacity' },
    { label: 'Movement Speed', value: 'SpeedMult', detail: 'Movement speed multiplier' },
    { label: 'Companion Affinity', value: 'com_affinity', detail: 'Core companion affinity points' },
    { label: 'Companion Relationship Level', value: 'com_affinitylevel', detail: '0 Neutral, 1 Friendship, 2 Affection, 3 Commitment' },
    { label: 'Companion Anger Level', value: 'com_angerlevel', detail: '0 Calm, 1 Annoyed, 2 Very Angry' },
  ],
};

export const SHIP_ACTOR_VALUE_PICKER: ReferenceIdPicker = {
  title: 'Choose Ship Actor Value',
  buttonLabel: 'Choose Value',
  searchPlaceholder: 'Search cargo, crew, reactor, grav, boost...',
  options: [
    { label: 'Cargo Capacity', value: 'CarryWeight', detail: 'Effective total; may include module modifiers' },
    { label: 'Shielded Cargo Capacity', value: 'CarryWeightShielded', detail: 'Effective shielded cargo total' },
    { label: 'Crew Capacity', value: 'SpaceshipCrewRating', detail: 'Effective ship crew rating' },
    { label: 'Reactor Power', value: 'SpaceshipReactorPower', detail: 'Effective reactor power' },
    { label: 'Grav Jump Fuel', value: 'SpaceshipGravJumpFuel', detail: 'Grav jump fuel actor value' },
    { label: 'Boost Fuel', value: 'SpaceshipBoostFuel', detail: 'Ship boost fuel actor value' },
    { label: 'Boost Recharge Rate', value: 'SpaceshipBoostRechargeRate', detail: 'Ship boost recharge actor value' },
  ],
};

export const GAME_SETTING_PICKER: ReferenceIdPicker = {
  title: 'Choose Game Setting',
  buttonLabel: 'Choose Value',
  searchPlaceholder: 'Search scanner, ship, distance, builder, limit...',
  options: [
    { label: 'Scanner Scan Range', value: 'fHandScannerScanRange', detail: 'Object, flora, and fauna scan distance', keywords: ['hand scanner'] },
    { label: 'Scanner Base Range', value: 'fHandScannerBaseRange', detail: 'Base distance used by scanner calculations', keywords: ['hand scanner'] },
    { label: 'Scanner Social Range', value: 'fHandScannerSocialRange', detail: 'NPC interaction scan distance', keywords: ['hand scanner', 'npc'] },
    { label: 'Maximum Owned Ships', value: 'uSpaceshipMaximumOwnedSpaceships', detail: 'Player-owned ship limit' },
    { label: 'Ship Looting Distance', value: 'fSpaceshipLootingDistanceDefault', detail: 'Distance for collecting space loot' },
    { label: 'Maximum Docking Distance', value: 'fSpaceshipMaxDockingDistance', detail: 'Maximum distance for docking interactions' },
    { label: 'Ship Cargo Transfer Distance', value: 'fMaxShipTransferDistance', detail: 'Distance for transferring ship cargo' },
    { label: 'Ship Builder Maximum Height', value: 'fSpaceshipBuilderMaxSizeZ', detail: 'Maximum ship-builder height' },
    { label: 'Landable Ship Maximum Size X', value: 'fSpaceshipLandableMaxSizeX', detail: 'Landing-size limit on the X axis' },
    { label: 'Landable Ship Maximum Size Y', value: 'fSpaceshipLandableMaxSizeY', detail: 'Landing-size limit on the Y axis' },
    { label: 'Landable Ship Maximum Size Z', value: 'fSpaceshipLandableMaxSizeZ', detail: 'Landing-size limit on the Z axis' },
    { label: 'Landable Small Ship Size', value: 'fSpaceshipLandableSmallSize', detail: 'Small-ship landing-size threshold' },
    { label: 'Ship Builder Module Limit', value: 'uSpaceshipBuilderMaxModules', detail: 'Normal ship-builder module-count limit' },
    { label: 'Ship Builder Module Hard Limit', value: 'uSpaceshipBuilderModuleHardLimit', detail: 'Hard ship-builder module-count limit' },
  ],
};

export const POPULAR_LOCATION_PICKER: ReferenceIdPicker = {
  title: 'Choose Popular Location',
  buttonLabel: 'Choose Location',
  searchPlaceholder: 'Search city, district, or landmark...',
  options: [
    { label: 'New Atlantis — Spaceport', value: 'NewAtlantisSpaceport', detail: 'Jemison, Alpha Centauri', keywords: ['new atlantis', 'jemison', 'city'] },
    { label: 'New Atlantis — The Lodge', value: 'CityNewAtlantisLodgeInt', detail: 'Constellation headquarters interior', keywords: ['new atlantis', 'jemison', 'constellation'] },
    { label: 'Akila City — Spaceport', value: 'CityAkilaSpaceport01', detail: 'Akila, Cheyenne', keywords: ['akila city', 'freestar', 'city'] },
    { label: 'Akila City — The Rock', value: 'CityAkilaTheRock01', detail: 'Freestar Rangers headquarters', keywords: ['akila city', 'freestar', 'rangers'] },
    { label: 'Neon — Spaceport', value: 'NeonSpaceport01', detail: 'Volii Alpha, Volii', keywords: ['neon city', 'volii', 'city'] },
    { label: 'Neon — Core', value: 'CityNeonCore', detail: 'Main city interior', keywords: ['neon city', 'volii', 'core'] },
    { label: 'Cydonia — Spaceport', value: 'CydoniaSpaceport01', detail: 'Mars, Sol', keywords: ['cydonia', 'mars', 'city'] },
    { label: 'Cydonia — Main Level', value: 'CityCydoniaMainLevel', detail: 'Main settlement interior', keywords: ['cydonia', 'mars', 'city'] },
  ],
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


export const FORM_TYPE_PICKER: ReferenceIdPicker = {
  title: 'Select Record Type',
  buttonLabel: 'Choose Type',
  searchPlaceholder: 'Search record type...',
  options: [
    { label: 'Weapons', value: 'WEAP', detail: 'Weapon records', keywords: ['gun', 'rifle', 'pistol'] },
    { label: 'Armor / Apparel', value: 'ARMO', detail: 'Armor and wearable records', keywords: ['suit', 'helmet', 'clothing'] },
    { label: 'Ammo', value: 'AMMO', detail: 'Ammunition records' },
    { label: 'Aid / Consumables', value: 'ALCH', detail: 'Food, medicine, and consumable records', keywords: ['aid', 'food', 'medicine'] },
    { label: 'Perks / Skills', value: 'PERK', detail: 'Perk, skill, trait, and background records', keywords: ['trait', 'background'] },
    { label: 'Spells / Powers', value: 'SPEL', detail: 'Spell, effect, and Starborn power records', keywords: ['power', 'effect'] },
    { label: 'NPCs', value: 'NPC_', detail: 'NPC base records', keywords: ['actor', 'character'] },
    { label: 'Object Mods', value: 'OMOD', detail: 'Weapon / armor modifier records', keywords: ['mod', 'attachment'] },
    { label: 'Factions', value: 'FACT', detail: 'Faction records' },
    { label: 'Quests', value: 'QUST', detail: 'Quest records' },
    { label: 'Cells', value: 'CELL', detail: 'Cell records', keywords: ['location'] },
    { label: 'Ships / Generic Base Forms', value: 'GBFM', detail: 'Ship and generic base-form records', keywords: ['ship'] },
    { label: 'Misc Items / Resources', value: 'MISC', detail: 'Miscellaneous item and resource records', keywords: ['resource', 'material'] },
    { label: 'Furniture', value: 'FURN', detail: 'Furniture and animation-marker records' },
  ],
};
