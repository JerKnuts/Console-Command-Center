type ShipIdGroup = {
  name: string;
  ids: readonly string[];
};

// Reviewed against Game8's Starfield ship-ID table on 2026-10-11.
// Alternate IDs are kept as separate searchable entries because they can
// represent faction, encounter, level, or vendor variants of the same design.
// Source: Game8, “List of All Ship IDs” (article 427021).
const SHIP_ID_GROUPS: readonly ShipIdGroup[] = [
  { name: 'Abyss Trekker', ids: ['000F31DB'] },
  { name: 'Achilles', ids: ['003A2E83', '0013A702', '0016C05D'] },
  { name: 'Achilles II', ids: ['00006FA0', '0013B48F', '003A2E81'] },
  { name: 'Aegis', ids: ['000F3078'] },
  { name: 'Asphalt CB', ids: ['000FAFF2', '003A2E59'] },
  { name: 'Autobahn III', ids: ['0001CB89', '0038D658'] },
  { name: 'Carry ALL', ids: ['000FAFEA'] },
  { name: 'Carry ALL III', ids: ['0002C1DB'] },
  { name: 'Conquerer', ids: ['0002C1F5'] },
  { name: 'Conquerer III', ids: ['0017EC76'] },
  { name: 'Crimson Fleet Ghost', ids: ['0031DF00', '0021E2A9'] },
  { name: 'Crimson Fleet Haunt', ids: ['0031DF60'] },
  { name: 'Crimson Fleet Phantom', ids: ['00322BE1'] },
  { name: 'Crossbow', ids: ['000FAFFA', '0013B55C'] },
  { name: 'Crossbow III', ids: ['0003D028', '0013B585', '003A2E13'] },
  { name: 'Discovery', ids: ['002E7461', '0005B554'] },
  { name: 'Dragonfire', ids: ['000FAFFE', '003A2E11'] },
  { name: 'Dragonfire II', ids: ['003A2E0F', '0003D024'] },
  { name: 'Dullahan', ids: ['000FAFF8', '003A2E0B'] },
  { name: 'Ecliptic Claymore', ids: ['00322C0B'] },
  { name: 'Ecliptic Stiletto II', ids: ['00322BF3'] },
  { name: 'Econohaul', ids: ['002CE40B'] },
  { name: 'Endeavor', ids: ['003D0C28'] },
  { name: 'Falcon', ids: ['0013B542', '001A7F6A'] },
  { name: 'Falcon IV', ids: ['003EC029', '0013B54B'] },
  { name: 'Freestar Narcissus', ids: ['0004237F'] },
  { name: 'Frontier', ids: ['0000B730'] },
  { name: 'Galileo', ids: ['0021CEAD'] },
  { name: 'Galileo III', ids: ['000423C2'] },
  { name: 'Gladius', ids: ['00147C8D'] },
  { name: 'Gladius II', ids: ['002ACB72'] },
  { name: 'Hammerhead', ids: ['001A7F69', '0013B54E'] },
  { name: 'Hoplite', ids: ['002EF76E'] },
  { name: 'Hoplite II', ids: ['003C9609'] },
  { name: 'Hoplite III', ids: ['003C9607'] },
  { name: 'Kepler R', ids: ['0016785D'] },
  { name: 'Kepler S', ids: ['0016785F'] },
  { name: 'Kfir', ids: ['00144893'] },
  { name: 'Kfir II', ids: ['000423CA'] },
  { name: 'Lil Muv', ids: ['00215E97'] },
  { name: 'Longsword', ids: ['0021C44B', '0037A56D'] },
  { name: 'Longsword IV', ids: ['00042AF8'] },
  { name: 'Mako', ids: ['001EB556'] },
  { name: 'Marathon', ids: ['000F2C63'] },
  { name: 'MULE', ids: ['000FAFD8', '0015D948', '003A2E8F'] },
  { name: 'MULE III', ids: ['00042364', '003A2E8B'] },
  { name: 'Murasame', ids: ['000F31C5'] },
  { name: 'Mustang', ids: ['00144895'] },
  { name: 'Naginata', ids: ['000FAFE0', '0013B554', '003A2E41'] },
  { name: 'Narcissus', ids: ['0021CEAF', '001F1392', '0020C644'] },
  { name: 'Narwhal', ids: ['000F3076'] },
  { name: 'Orca', ids: ['0038234D'] },
  { name: 'Pelican', ids: ['00215E9D'] },
  { name: 'Pik Up', ids: ['001E052A'] },
  { name: 'Polis II', ids: ['003E60D9'] },
  { name: 'Privateer', ids: ['0021CEA9'] },
  { name: 'Pterosaur', ids: ['000FAFDE', '003A2E3B'] },
  { name: 'Rambler', ids: ['00042372', '0033CA69'] },
  { name: 'Rambler II', ids: ['00042374', '000423EC'] },
  { name: 'Ranger', ids: ['000D40B0'] },
  { name: 'Raptor', ids: ['00036279', '003A2E7D', '000994B2'] },
  { name: 'Razorleaf', ids: ['0002CC6C'] },
  { name: 'Responder', ids: ['003A2E6B', '0033E765'] },
  { name: 'Responder II', ids: ['000423EE', '003A2E69'] },
  { name: 'Roanoke', ids: ['0021CEAB'] },
  { name: 'Shackleton', ids: ['000F31C7'] },
  { name: 'Shieldbreaker', ids: ['000F2DBE'] },
  { name: 'Silent Runner', ids: ['000F2E5B'] },
  { name: 'Slipstream', ids: ['003A2E23', '000FAFE8'] },
  { name: 'Slipstream II', ids: ['003A2E21', '0002C1BE'] },
  { name: 'Space OX', ids: ['003A2E4D', '0036D871'] },
  { name: 'Spacer Coyote III', ids: ['0033CA59'] },
  { name: 'Sparrow', ids: ['0013B53B', '00215E9B', '001E893E'] },
  { name: 'Star Eagle', ids: ['001322D8', '000392D8'] },
  { name: 'Star Semi', ids: ['0003D01A', '0003CFB2'] },
  { name: 'Starborn Guardian', ids: ['0003732A', '00180F18', '001F6959', '002D07F5', '002D16C8', '002D19E5'] },
  { name: 'Starborn Guardian II', ids: ['00180F18'] },
  { name: 'Starborn Guardian III', ids: ['00180F18'] },
  { name: 'Starborn Guardian IV', ids: ['00180F18'] },
  { name: 'Starborn Guardian V', ids: ['00180F18'] },
  { name: 'Starborn Guardian VI', ids: ['00180F18'] },
  { name: 'Stronghold', ids: ['000F31E4'] },
  { name: 'Sunsail', ids: ['00058886'] },
  { name: 'Thresher', ids: ['003A2E77', '0033B18B'] },
  { name: 'Thresher II', ids: ['00248F08', '003A2E75'] },
  { name: 'Trader Railstar', ids: ['00333D9E'] },
  { name: 'Trader Wagon Train', ids: ['00347145'] },
  { name: 'Transpo', ids: ['003A2E5F', '0033E767'] },
  { name: 'Trebuchet', ids: ['001A39A8'] },
  { name: 'UC Prison Shuttle', ids: ['001E29E5'] },
  { name: 'Vagabond', ids: ['000F31CE'] },
  { name: 'Vanquisher III', ids: ['000B2C0F'] },
  { name: 'Vindicator', ids: ['0019EC49'] },
  { name: 'Vindicator III', ids: ['0000C355'] },
  { name: 'Vista III', ids: ['00010368', '0038D64C'] },
  { name: 'Wanderlust', ids: ['000F31D0'] },
  { name: 'Wanderwell', ids: ['00038B42'] },
  { name: 'War Horse', ids: ['000F31C9'] },
  { name: 'Warhammer', ids: ['000FAFE4', '003A2E2F'] },
  { name: 'Watchdog', ids: ['0015809D', '0020AFD0'] },
  { name: 'Watchdog II', ids: ['001B7BF4', '001388DE'] },
  { name: 'Wendigo', ids: ['0006CA05', '003A2E71'] },
  { name: 'Wendigo II', ids: ['0026DEB1', '003A2E6F'] },
  { name: 'Zumwalt', ids: ['0000877F'] },
];

const shipsById = new Map<string, {
  label: string;
  value: string;
  type: 'GBFM';
  category: string;
  detail: string;
  keywords: string[];
  action: 'spawn';
}>();

for (const { name, ids } of SHIP_ID_GROUPS) {
  ids.forEach((value, index) => {
    const existing = shipsById.get(value);
    if (existing) {
      if (!existing.keywords.includes(name)) existing.keywords.push(name);
      return;
    }
    shipsById.set(value, {
      label: index === 0 ? name : `${name} — Alternate ${index + 1}`,
      value,
      type: 'GBFM',
      category: 'Ships',
      detail: ids.length === 1
        ? 'Reviewed ship Base ID. Spawning remains experimental.'
        : `Reviewed ship Base ID ${index + 1} of ${ids.length}. Variants may differ by faction, encounter, level, or vendor.`,
      keywords: [name, 'ship', 'Game8'],
      action: 'spawn',
    });
  });
}

export const REVIEWED_SHIP_CATALOG = [...shipsById.values()];

export const REVIEWED_SHIP_GROUP_COUNT = SHIP_ID_GROUPS.length;
export const REVIEWED_SHIP_ID_COUNT = REVIEWED_SHIP_CATALOG.length;
