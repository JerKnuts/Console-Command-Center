import { BOUNTY_FACTION_PICKER, CORE_COMPANION_PICKER, WEATHER_PICKER } from './reference-ids';

export type IdCatalogAction = 'additem' | 'addperk' | 'addspell' | 'spawn';

export type IdCatalogEntry = {
  label: string;
  value: string;
  type: string;
  category: string;
  detail?: string;
  keywords?: string[];
  action?: IdCatalogAction;
  source?: 'built-in' | 'live';
};

export type IdBrowserCategory = {
  label: string;
  value: string;
  detail: string;
  recordType: string;
  builtInCategories: string[];
};

// These are intentionally broad Starfield record groups rather than a dump of
// every known Form ID. The native browser searches the running game's loaded
// forms, so it also works with DLC and the user's loaded mods.
export const ID_BROWSER_CATEGORIES: IdBrowserCategory[] = [
  { label: 'All Categories', value: 'all', detail: 'All built-in IDs and every matching loaded-game record.', recordType: '', builtInCategories: ['*'] },
  { label: 'Common Items', value: 'common', detail: 'Credits, digipicks, med packs, and ship parts.', recordType: '', builtInCategories: ['Common'] },
  { label: 'Weapons', value: 'weapons', detail: 'Weapons and guns.', recordType: 'WEAP', builtInCategories: ['Weapons'] },
  { label: 'Armor / Apparel', value: 'armor', detail: 'Spacesuits, helmets, packs, and clothing.', recordType: 'ARMO', builtInCategories: ['Armor'] },
  { label: 'Ammo', value: 'ammo', detail: 'Ammunition records.', recordType: 'AMMO', builtInCategories: ['Ammo'] },
  { label: 'Aid / Consumables', value: 'aid', detail: 'Food, medicine, and consumable records.', recordType: 'ALCH', builtInCategories: [] },
  { label: 'Resources / Miscellaneous', value: 'resources', detail: 'Resources, components, and miscellaneous items.', recordType: 'MISC', builtInCategories: ['Resources'] },
  { label: 'Perks / Skills / Traits', value: 'perks', detail: 'Skills, perks, backgrounds, and traits.', recordType: 'PERK', builtInCategories: ['Perks'] },
  { label: 'Spells / Powers', value: 'powers', detail: 'Powers, spells, and effect records.', recordType: 'SPEL', builtInCategories: [] },
  { label: 'NPCs / Companions', value: 'npcs', detail: 'NPC base records and built-in companion references.', recordType: 'NPC_', builtInCategories: ['Companions'] },
  { label: 'Weapon / Armor Mods', value: 'mods', detail: 'Weapon and armor modifier records.', recordType: 'OMOD', builtInCategories: ['Mods'] },
  { label: 'Factions', value: 'factions', detail: 'Faction records.', recordType: 'FACT', builtInCategories: ['Factions'] },
  { label: 'Quests', value: 'quests', detail: 'Quest records.', recordType: 'QUST', builtInCategories: [] },
  { label: 'Locations / Cells', value: 'locations', detail: 'Location and cell records.', recordType: 'CELL', builtInCategories: [] },
  { label: 'Ships / Base Forms', value: 'ships', detail: 'Ships and generic base-form records.', recordType: 'GBFM', builtInCategories: [] },
  { label: 'Furniture', value: 'furniture', detail: 'Furniture and animation-marker records.', recordType: 'FURN', builtInCategories: [] },
  { label: 'Weather', value: 'weather', detail: 'Weather records.', recordType: 'WTHR', builtInCategories: ['Weather'] },
];

const BASE_CATALOG: IdCatalogEntry[] = [
  // COMMON
  { label: 'Credits', value: '0000000F', type: 'MISC', category: 'Common', detail: 'Currency', keywords: ['money'], action: 'additem' },
  { label: 'Digipick', value: '0000000A', type: 'MISC', category: 'Common', detail: 'Lockpick', keywords: ['lockpick'], action: 'additem' },
  { label: 'Med Pack', value: '0000ABF9', type: 'ALCH', category: 'Common', detail: 'Healing aid', keywords: ['medpack', 'health'], action: 'additem' },
  { label: 'Ship Parts', value: '0003FB19', type: 'ALCH', category: 'Common', detail: 'Ship repair item', keywords: ['repair'], action: 'additem' },

  // WEAPONS — a useful starter set. Live Search can find the rest.
  { label: 'AA-99', value: '002BF65B', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Arc Welder', value: '0026D965', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Auto-Rivet', value: '0026D964', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Barrow Knife', value: '0026F181', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Beowulf', value: '0004716C', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Breach', value: '000547A3', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Coachman', value: '0026D96B', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Cutter', value: '00016758', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Drum Beat', value: '0018DE2C', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Eon', value: '000476C4', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Equinox', value: '0001BC4F', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Grendel', value: '00028A02', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Hard Target', value: '000546CC', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Kodama', value: '00253A16', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Lawgiver', value: '0002D7F4', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Maelstrom', value: '002984DF', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'MagPulse', value: '00023606', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'MagShear', value: '0002EB3C', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'MagShot', value: '0002EB42', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'MagSniper', value: '0002EB45', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'MagStorm', value: '0026035E', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Microgun', value: '000546CD', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Orion', value: '002773C8', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Pacifier', value: '002953F8', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Razorback', value: '00000FD6', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Regulator', value: '0002CB5F', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Sidestar', value: '0026D95D', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Solstice', value: '0026D961', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Tombstone', value: '0002EB36', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Urban Eagle', value: '0026D96D', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: "Va'ruun Inflictor", value: '0026D8A0', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: "Va'ruun Painblade", value: '0026D8A2', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: "Va'ruun Starshard", value: '0026D8A4', type: 'WEAP', category: 'Weapons', action: 'additem' },
  { label: 'Wakizashi', value: '0026D8A1', type: 'WEAP', category: 'Weapons', action: 'additem' },

  // ARMOR / SPACESUITS — common base-game examples. Live Search can find helmets, packs, apparel, DLC, and modded armor.
  { label: 'Bounty Hunter Spacesuit', value: '00228570', type: 'ARMO', category: 'Armor', action: 'additem' },
  { label: 'Constellation Spacesuit', value: '001E2B18', type: 'ARMO', category: 'Armor', action: 'additem' },
  { label: 'Deep Mining Spacesuit', value: '0005278E', type: 'ARMO', category: 'Armor', action: 'additem' },
  { label: 'Deep Recon Spacesuit', value: '002265AE', type: 'ARMO', category: 'Armor', action: 'additem' },
  { label: 'Deepcore Spacesuit', value: '0006AC00', type: 'ARMO', category: 'Armor', action: 'additem' },
  { label: 'Deepseeker Spacesuit', value: '0016D2C4', type: 'ARMO', category: 'Armor', action: 'additem' },
  { label: 'Deimos Spacesuit', value: '00026BF1', type: 'ARMO', category: 'Armor', action: 'additem' },
  { label: 'Ecliptic Spacesuit', value: '0022856F', type: 'ARMO', category: 'Armor', action: 'additem' },
  { label: 'Explorer Spacesuit', value: '002265AF', type: 'ARMO', category: 'Armor', action: 'additem' },
  { label: 'Mantis Spacesuit', value: '00226299', type: 'ARMO', category: 'Armor', action: 'additem' },
  { label: 'Mark I Spacesuit', value: '0001754D', type: 'ARMO', category: 'Armor', action: 'additem' },
  { label: 'Mercury Spacesuit', value: '001D0F96', type: 'ARMO', category: 'Armor', action: 'additem' },
  { label: 'Navigator Spacesuit', value: '00067C94', type: 'ARMO', category: 'Armor', action: 'additem' },
  { label: 'Old Earth Spacesuit', value: '0003084E', type: 'ARMO', category: 'Armor', action: 'additem' },
  { label: 'Pirate Assault Spacesuit', value: '00066821', type: 'ARMO', category: 'Armor', action: 'additem' },
  { label: 'Pirate Charger Spacesuit', value: '00066826', type: 'ARMO', category: 'Armor', action: 'additem' },
  { label: 'Pirate Corsair Spacesuit', value: '00066828', type: 'ARMO', category: 'Armor', action: 'additem' },
  { label: 'Pirate Sniper Spacesuit', value: '0006682A', type: 'ARMO', category: 'Armor', action: 'additem' },
  { label: 'Ranger Spacesuit', value: '00227CA0', type: 'ARMO', category: 'Armor', action: 'additem' },
  { label: 'Shocktroop Spacesuit', value: '002265AD', type: 'ARMO', category: 'Armor', action: 'additem' },

  // PERKS / SKILLS — common starter records. Live Search can find the full skill/trait set.
  { label: 'Ballistics', value: '002CFCAB', type: 'PERK', category: 'Perks', action: 'addperk' },
  { label: 'Ballistic Weapon Systems', value: '002CE2C2', type: 'PERK', category: 'Perks', action: 'addperk' },
  { label: 'Boost Pack Training', value: '00146C2C', type: 'PERK', category: 'Perks', action: 'addperk' },
  { label: 'Piloting', value: '002CFCAC', type: 'PERK', category: 'Perks', action: 'addperk' },
  { label: 'Security', value: '002CE2E2', type: 'PERK', category: 'Perks', action: 'addperk' },
  { label: 'Commerce', value: '002C5A8E', type: 'PERK', category: 'Perks', action: 'addperk' },
  { label: 'Medicine', value: '002CE2DF', type: 'PERK', category: 'Perks', action: 'addperk' },
  { label: 'Research Methods', value: '002C555C', type: 'PERK', category: 'Perks', action: 'addperk' },
  { label: 'Scanning', value: '002CFCB1', type: 'PERK', category: 'Perks', action: 'addperk' },
  { label: 'Spacesuit Design', value: '0027CBC3', type: 'PERK', category: 'Perks', action: 'addperk' },
  { label: 'Weapon Engineering', value: '002C890C', type: 'PERK', category: 'Perks', action: 'addperk' },
  { label: 'Astrodynamics', value: '002C5560', type: 'PERK', category: 'Perks', action: 'addperk' },
  { label: 'Geology', value: '002CE29F', type: 'PERK', category: 'Perks', action: 'addperk' },
  { label: 'Botany', value: '002C5557', type: 'PERK', category: 'Perks', action: 'addperk' },
  { label: 'Starship Design', value: '002C59DC', type: 'PERK', category: 'Perks', action: 'addperk' },
  { label: 'Starship Engineering', value: '002AC953', type: 'PERK', category: 'Perks', action: 'addperk' },
  { label: 'Shield Systems', value: '002C2C59', type: 'PERK', category: 'Perks', action: 'addperk' },
  { label: 'Ship Command', value: '002C53B3', type: 'PERK', category: 'Perks', action: 'addperk' },
  { label: 'Targeting Control Systems', value: '002C5559', type: 'PERK', category: 'Perks', action: 'addperk' },
  { label: 'Engine Systems', value: '002CE2DE', type: 'PERK', category: 'Perks', action: 'addperk' },

  // AMMO
  { label: '.27 Caliber', value: '002B559C', type: 'AMMO', category: 'Ammo', action: 'additem' },
  { label: '.43 MI Array', value: '002B559A', type: 'AMMO', category: 'Ammo', action: 'additem' },
  { label: '.43 Ultramag', value: '002B5599', type: 'AMMO', category: 'Ammo', action: 'additem' },
  { label: '.45 Caliber ACP', value: '002B5598', type: 'AMMO', category: 'Ammo', action: 'additem' },
  { label: '.50 Caliber Caseless', value: '002B5597', type: 'AMMO', category: 'Ammo', action: 'additem' },
  { label: '.50 MI Array', value: '002B5596', type: 'AMMO', category: 'Ammo', action: 'additem' },
  { label: '1.5kV LZR Cartridge', value: '002BAE3F', type: 'AMMO', category: 'Ammo', action: 'additem' },
  { label: '11mm Caseless', value: '002B5595', type: 'AMMO', category: 'Ammo', action: 'additem' },
  { label: '12.5mm ST Rivet', value: '002B5594', type: 'AMMO', category: 'Ammo', action: 'additem' },
  { label: '12G Shotgun Shell', value: '000547A1', type: 'AMMO', category: 'Ammo', action: 'additem' },
  { label: '15x25 CLL Shotgun Shell', value: '002B4AFC', type: 'AMMO', category: 'Ammo', action: 'additem' },
  { label: '3kV LZR Cartridge', value: '0000E8EC', type: 'AMMO', category: 'Ammo', action: 'additem' },
  { label: '40mm XPL', value: '002B5592', type: 'AMMO', category: 'Ammo', action: 'additem' },
  { label: '6.5mm CT', value: '002B5590', type: 'AMMO', category: 'Ammo', action: 'additem' },
  { label: '6.5mm MI Array', value: '002B558F', type: 'AMMO', category: 'Ammo', action: 'additem' },
  { label: '7.5mm Whitehot', value: '002B558E', type: 'AMMO', category: 'Ammo', action: 'additem' },
  { label: '7.62x39mm', value: '002B558D', type: 'AMMO', category: 'Ammo', action: 'additem' },
  { label: '7.77mm Caseless', value: '0004AD3E', type: 'AMMO', category: 'Ammo', action: 'additem' },
  { label: '9x39mm', value: '002B559B', type: 'AMMO', category: 'Ammo', action: 'additem' },

  // RESOURCES / COMPONENTS
  { label: 'Adaptive Frame', value: '00246B6A', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Adhesive', value: '000055B1', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Aldumite', value: '00005DEC', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Alkanes', value: '00005570', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Aluminum', value: '0000557D', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Amino Acids', value: '000055CD', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Analgesic', value: '000055A9', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Antimicrobial', value: '000055AB', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Antimony', value: '0000557B', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Argon', value: '00005588', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Aromatic', value: '000055B8', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Austenitic Manifold', value: '00246B7C', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Benzene', value: '00005585', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Beryllium', value: '000057D9', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Biosuppressant', value: '000055B2', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Caelumite', value: '000788D6', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Caesium', value: '000057DF', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Carboxylic Acids', value: '00005586', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Chasmbass Oil', value: '0013BD9C', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Chlorine', value: '0000557C', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Chlorosilanes', value: '0000557E', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Cobalt', value: '00005575', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Comm Relay', value: '00246B64', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Control Rod', value: '00246B7B', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Copper', value: '00005576', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Cosmetic', value: '000055A8', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Deformable Nozzle', value: '00246B7A', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Drilling Rig', value: '0020A02F', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Dysprosium', value: '00005569', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Electron Pump', value: '00246B63', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Europium', value: '000057E1', type: 'MISC', category: 'Resources', action: 'additem' },
  { label: 'Fiber', value: '000055AF', type: 'MISC', category: 'Resources', action: 'additem' },

  // MODIFIER IDS
  { label: 'Ablative', value: '0013369C', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Acrobat', value: '000710FD', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Advanced (Armor)', value: '0011E2B9', type: 'OMOD', category: 'Mods', detail: 'Armor quality modifier' },
  { label: 'Analyzer', value: '000690AF', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Anti-Ballistic', value: '0013369E', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Antiseptic', value: '000710FA', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Armor-Plated', value: '002EDE59', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Assisted Carry', value: '002EDE4F', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Auto Medic', value: '000C9A43', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Beast Hunter', value: '001336BD', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Calibrated (Armor)', value: '0011E2BC', type: 'OMOD', category: 'Mods', detail: 'Armor quality modifier' },
  { label: 'Chameleon', value: '001336C1', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Combat Veteran', value: '001336BE', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Disassembler', value: '001625EB', type: 'OMOD', category: 'Mods', detail: 'Weapon modifier' },
  { label: 'Extended Magazine', value: '000FFA3B', type: 'OMOD', category: 'Mods', detail: 'Weapon modifier' },
  { label: 'Fastened', value: '002EDE4E', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Galvanized', value: '000710F7', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Hacker', value: '002C43DA', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Headhunter', value: '002C43DC', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Incendiary', value: '0007D728', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Leadlined', value: '000710F5', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Liquid Cooled', value: '000710F6', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Mechanized', value: '000BE542', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Mirrored', value: '00059AE8', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'O2 Boosted', value: '000690B0', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'O2 Filter', value: '000690AE', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Rapid', value: '000FEA04', type: 'OMOD', category: 'Mods', detail: 'Weapon modifier' },
  { label: 'Refined (Armor)', value: '0011E2BA', type: 'OMOD', category: 'Mods', detail: 'Armor quality modifier' },
  { label: 'Repulsing', value: '0006029D', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Resource Hauler', value: '00060293', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Sensor Chip', value: '002C43DB', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Sentinel', value: '000BE540', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Staggering', value: '000E8D64', type: 'OMOD', category: 'Mods', detail: 'Weapon / armor modifier' },
  { label: 'Sturdy', value: '00133699', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Superior (Armor)', value: '0003AF7D', type: 'OMOD', category: 'Mods', detail: 'Armor quality modifier' },
  { label: 'Weapon Holsters', value: '00060295', type: 'OMOD', category: 'Mods', detail: 'Armor modifier' },
  { label: 'Calibrated (Weapon)', value: '0028F442', type: 'OMOD', category: 'Mods', detail: 'Weapon quality modifier' },
  { label: 'Refined (Weapon)', value: '0028F443', type: 'OMOD', category: 'Mods', detail: 'Weapon quality modifier' },
  { label: 'Advanced (Weapon)', value: '0028F444', type: 'OMOD', category: 'Mods', detail: 'Weapon quality modifier' },
];

const pickerEntries: IdCatalogEntry[] = [
  ...BOUNTY_FACTION_PICKER.options.map((option) => ({
    label: option.label,
    value: option.value,
    type: 'FACT',
    category: 'Factions',
    detail: option.detail,
    keywords: option.keywords,
  })),
  ...CORE_COMPANION_PICKER.options.map((option) => ({
    label: option.label,
    value: option.value,
    type: 'REF',
    category: 'Companions',
    detail: option.detail,
    keywords: option.keywords,
  })),
  ...WEATHER_PICKER.options.map((option) => ({
    label: option.label,
    value: option.value,
    type: 'WTHR',
    category: 'Weather',
    detail: option.detail,
    keywords: option.keywords,
  })),
];

export const ID_CATALOG: IdCatalogEntry[] = [...BASE_CATALOG, ...pickerEntries]
  .map((entry) => ({ ...entry, source: 'built-in' as const }))
  .sort((a, b) => a.label.localeCompare(b.label));
