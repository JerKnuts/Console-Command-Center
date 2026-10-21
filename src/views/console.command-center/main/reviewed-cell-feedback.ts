// Reviewed feedback exports through October 20, 22:03, keyed by plugin and local CELL ID.
// Includes the explicit request to shorten every Dazra Outskirts exterior label.
type CellRecord={type?:string;value:string;plugin?:string;localFormId?:string;label:string;originalName?:string;keywords?:string[]};
const NAMES:Record<string,{label:string;previous:string}>={
  "sfbgs00d.esm:003A32": {
    "label": "Travel Stop",
    "previous": "SFBGS00DDR006Ext"
  },
  "sfbgs00d.esm:003A33": {
    "label": "Travel Stop",
    "previous": "SFBGS00DDR006Ext4"
  },
  "sfbgs00d.esm:003A34": {
    "label": "Travel Stop",
    "previous": "SFBGS00DDR006Ext3"
  },
  "sfbgs00d.esm:003A36": {
    "label": "Travel Stop",
    "previous": "SFBGS00DDR006Ext2"
  },
  "sfbgs00d.esm:00BF39": {
    "label": "Scattered Shipwreck",
    "previous": "Scattered Shipwreck — Exterior (-1, 0)"
  },
  "sfbgs00d.esm:00BF3A": {
    "label": "Scattered Shipwreck",
    "previous": "Scattered Shipwreck — Exterior (-1, -1)"
  },
  "sfbgs00d.esm:00CBD5": {
    "label": "Scattered Shipwreck",
    "previous": "Scattered Shipwreck — Exterior (0, -1)"
  },
  "sfbgs00d.esm:00CBDB": {
    "label": "Scattered Shipwreck",
    "previous": "Scattered Shipwreck — Exterior (0, 0)"
  },
  "sfbgs00d.esm:0248A4": {
    "label": "Anchorpoint",
    "previous": "SFFLAnchorpoint Station Interior"
  },
  "sfbgs00d.esm:046428": {
    "label": "Geological Survey Site",
    "previous": "SFFLOEAR07Ext"
  },
  "sfbgs00d.esm:049D90": {
    "label": "Bodach Asteroid Mine Cavern",
    "previous": "Bodach Asteroid Mine Cavern — Interior"
  },
  "sfbgs050.esm:00F9F6": {
    "label": "EC Robot Alias Cell",
    "previous": "EC Robot Alias Cell — Alias Cell"
  },
  "sfbgs050.esm:014BB4": {
    "label": "Machina Forge Prime Cavern",
    "previous": "Machina Forge Prime Cavern — Interior"
  },
  "sfbgs050.esm:038811": {
    "label": "Santos Homestead",
    "previous": "Santos Homestead — Exterior (0, 0)"
  },
  "shatteredspace.esm:034E03": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-3, 3)"
  },
  "shatteredspace.esm:036B44": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (1, 3)"
  },
  "shatteredspace.esm:04100A": {
    "label": "Overlook Watchtower",
    "previous": "Overlook Watchtower — Exterior (0, -3)"
  },
  "shatteredspace.esm:046D0D": {
    "label": "Overlook Watchtower",
    "previous": "Overlook Watchtower — Exterior (-1, -2)"
  },
  "shatteredspace.esm:046D0E": {
    "label": "Overlook Watchtower",
    "previous": "Overlook Watchtower — Exterior (-1, -3)"
  },
  "shatteredspace.esm:0470D1": {
    "label": "Scaled Citadel",
    "previous": "Scaled Citadel — Exterior (3, 0)"
  },
  "shatteredspace.esm:047105": {
    "label": "Lakelands Power Station",
    "previous": "Lakelands Power Station — Exterior (4, -9)"
  },
  "shatteredspace.esm:047107": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (6, -8)"
  },
  "shatteredspace.esm:04710B": {
    "label": "Ma'leen Dam",
    "previous": "Ma'leen Dam — Exterior (9, -5)"
  },
  "shatteredspace.esm:04710D": {
    "label": "Deep Gorge Refinery",
    "previous": "Deep Gorge Refinery — Exterior (10, -10)"
  },
  "shatteredspace.esm:0474B2": {
    "label": "Deep Gorge Refinery",
    "previous": "Deep Gorge Refinery — Exterior (10, -11)"
  },
  "shatteredspace.esm:0475F1": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (8, -9)"
  },
  "shatteredspace.esm:0478D6": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-7, -9)"
  },
  "shatteredspace.esm:0478DA": {
    "label": "Dazra Seaweed Farms",
    "previous": "Dazra Seaweed Farms — Exterior (-4, 0)"
  },
  "shatteredspace.esm:0485D0": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (5, 1)"
  },
  "shatteredspace.esm:0485D5": {
    "label": "Scaled Citadel",
    "previous": "Scaled Citadel — Exterior (4, 1)"
  },
  "shatteredspace.esm:0485D6": {
    "label": "Scaled Citadel",
    "previous": "Scaled Citadel — Exterior (4, 0)"
  },
  "shatteredspace.esm:0485D7": {
    "label": "Dazra Orphanage",
    "previous": "Dazra Orphanage — Exterior (4, -2)"
  },
  "shatteredspace.esm:0485D8": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (3, 2)"
  },
  "shatteredspace.esm:0485D9": {
    "label": "Scaled Citadel",
    "previous": "Scaled Citadel — Exterior (3, 1)"
  },
  "shatteredspace.esm:0485DB": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (2, 2)"
  },
  "shatteredspace.esm:0485DE": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (1, 0)"
  },
  "shatteredspace.esm:0485E0": {
    "label": "Scaled Citadel",
    "previous": "Scaled Citadel — Exterior (3, -1)"
  },
  "shatteredspace.esm:04C1DB": {
    "label": "Shadow Station Epsilon",
    "previous": "Shadow Station Epsilon — Exterior (3, 9)"
  },
  "shatteredspace.esm:04C1DD": {
    "label": "Control Site Kappa",
    "previous": "Control Site Kappa — Exterior (-5, -10)"
  },
  "shatteredspace.esm:04C1DE": {
    "label": "Badlands Power Station",
    "previous": "Badlands Power Station — Exterior (4, 4)"
  },
  "shatteredspace.esm:04C1E0": {
    "label": "Hillcountry Power Relay",
    "previous": "Hillcountry Power Relay — Exterior (-7, -7)"
  },
  "shatteredspace.esm:04C1E1": {
    "label": "Chunks",
    "previous": "Chunks — Exterior (-5, -3)"
  },
  "shatteredspace.esm:04C1E2": {
    "label": "Orahim's Shack",
    "previous": "Orahim's Shack — Exterior (-5, -5)"
  },
  "shatteredspace.esm:04C1E3": {
    "label": "Malik's Groat Farm",
    "previous": "Malik's Groat Farm — Exterior (-7, -2)"
  },
  "shatteredspace.esm:04C1E4": {
    "label": "Hollow Bluff Depot",
    "previous": "Hollow Bluff Depot — Exterior (-11, -1)"
  },
  "shatteredspace.esm:04C1E9": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (8, -10)"
  },
  "shatteredspace.esm:04C1EB": {
    "label": "Listening Post Alpha",
    "previous": "Listening Post Alpha — Exterior (-9, -11)"
  },
  "shatteredspace.esm:04C1EC": {
    "label": "Cave",
    "previous": "Cave — Exterior (-10, -9)"
  },
  "shatteredspace.esm:04C1ED": {
    "label": "Dazra Groat Farms",
    "previous": "Dazra Groat Farms — Exterior (1, -4)"
  },
  "shatteredspace.esm:04C1F1": {
    "label": "Listening Post Beta",
    "previous": "Listening Post Beta — Exterior (6, 2)"
  },
  "shatteredspace.esm:04C1F3": {
    "label": "Misthaze Cavern",
    "previous": "Misthaze Cavern — Exterior (7, -1)"
  },
  "shatteredspace.esm:04C1F4": {
    "label": "Apostate's Refuge",
    "previous": "Apostate's Refuge — Exterior (-10, 9)"
  },
  "shatteredspace.esm:04C1F6": {
    "label": "Abandoned Camp",
    "previous": "Abandoned Camp — Exterior (-8, 3)"
  },
  "shatteredspace.esm:04C1FA": {
    "label": "Hamadi Station",
    "previous": "Hamadi Station — Exterior (-8, 1)"
  },
  "shatteredspace.esm:04C1FF": {
    "label": "Badlands Power Relay",
    "previous": "Badlands Power Relay — Exterior (-3, 6)"
  },
  "shatteredspace.esm:04C204": {
    "label": "Irina's Farm",
    "previous": "Irina's Farm — Exterior (-10, 6)"
  },
  "shatteredspace.esm:04C20B": {
    "label": "Dazra Abandoned Outpost",
    "previous": "Abandoned Outpost — Exterior (-4, 9)"
  },
  "shatteredspace.esm:04C24C": {
    "label": "Hermit Groat Farm",
    "previous": "Hermit Groat Farm — Exterior (-1, -4)"
  },
  "shatteredspace.esm:04C271": {
    "label": "Hermit Groat Farm",
    "previous": "Hermit Groat Farm — Exterior (-1, -3)"
  },
  "shatteredspace.esm:04C272": {
    "label": "Orm Filtration Facility",
    "previous": "Orm Filtration Facility — Exterior (0, 0)"
  },
  "shatteredspace.esm:04C276": {
    "label": "Orm Filtration Facility",
    "previous": "Orm Filtration Facility — Exterior (-2, -1)"
  },
  "shatteredspace.esm:04C278": {
    "label": "Orm Filtration Facility",
    "previous": "Orm Filtration Facility — Exterior (-2, 0)"
  },
  "shatteredspace.esm:04C279": {
    "label": "Orm Filtration Facility",
    "previous": "Orm Filtration Facility — Exterior (-1, -1)"
  },
  "shatteredspace.esm:04C27A": {
    "label": "Orm Filtration Facility",
    "previous": "Orm Filtration Facility — Exterior (-1, 0)"
  },
  "shatteredspace.esm:04C280": {
    "label": "Va'ruun'kai",
    "previous": "SFBGS001LC54Ext05"
  },
  "shatteredspace.esm:050AD0": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-6, -10)"
  },
  "shatteredspace.esm:052B30": {
    "label": "Lake Watchtower",
    "previous": "Lake Watchtower — Exterior (-4, -1)"
  },
  "shatteredspace.esm:052B66": {
    "label": "Lakeside Dock",
    "previous": "Lakeside Dock — Exterior (-3, 3)"
  },
  "shatteredspace.esm:053EF9": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (2, -4)"
  },
  "shatteredspace.esm:057487": {
    "label": "Lakeside Dock",
    "previous": "Lakeside Dock — Exterior (-4, 3)"
  },
  "shatteredspace.esm:05A5C0": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-7, -3)"
  },
  "shatteredspace.esm:05ACB0": {
    "label": "Ma'leen Dam",
    "previous": "Ma'leen Dam — Exterior (9, -6)"
  },
  "shatteredspace.esm:05ACB1": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (8, -3)"
  },
  "shatteredspace.esm:05ACB2": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (8, -4)"
  },
  "shatteredspace.esm:05ACB3": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (8, -5)"
  },
  "shatteredspace.esm:05ACB4": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (8, -6)"
  },
  "shatteredspace.esm:05B192": {
    "label": "Dazra Abandoned Outpost",
    "previous": "Abandoned Outpost — Exterior (-4, 10)"
  },
  "shatteredspace.esm:05BE8F": {
    "label": "Improvised Shelter",
    "previous": "Improvised Shelter — Exterior (3, 3)"
  },
  "shatteredspace.esm:05D10D": {
    "label": "Va'ruun'kai",
    "previous": "SFBGS001Dazra OE21Ext"
  },
  "shatteredspace.esm:05F5D5": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-6, 9)"
  },
  "shatteredspace.esm:05F5D7": {
    "label": "Dazra Abandoned Outpost",
    "previous": "Abandoned Outpost — Exterior (-5, 9)"
  },
  "shatteredspace.esm:05F5D8": {
    "label": "Dazra Abandoned Outpost",
    "previous": "Abandoned Outpost — Exterior (-5, 10)"
  },
  "shatteredspace.esm:05F6F0": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-1, 6)"
  },
  "shatteredspace.esm:05F6F9": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-2, 4)"
  },
  "shatteredspace.esm:06133C": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (1, 6)"
  },
  "shatteredspace.esm:06871F": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (2, -9)"
  },
  "shatteredspace.esm:06DCC4": {
    "label": "Abbas Seaweed Farm",
    "previous": "Abbas Seaweed Farm — Exterior (9, -7)"
  },
  "shatteredspace.esm:06DCC5": {
    "label": "Abbas Seaweed Farm",
    "previous": "Abbas Seaweed Farm — Exterior (9, -8)"
  },
  "shatteredspace.esm:06DCC6": {
    "label": "Abbas Seaweed Farm",
    "previous": "Abbas Seaweed Farm — Exterior (8, -7)"
  },
  "shatteredspace.esm:06DCC7": {
    "label": "Abbas Seaweed Farm",
    "previous": "Abbas Seaweed Farm — Exterior (8, -8)"
  },
  "shatteredspace.esm:06DCC8": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (7, -6)"
  },
  "shatteredspace.esm:070E16": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-10, -10)"
  },
  "shatteredspace.esm:070E17": {
    "label": "Listening Post Alpha",
    "previous": "Listening Post Alpha — Exterior (-9, -10)"
  },
  "shatteredspace.esm:070E18": {
    "label": "Listening Post Alpha",
    "previous": "Listening Post Alpha — Exterior (-10, -11)"
  },
  "shatteredspace.esm:0717E4": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (8, 2)"
  },
  "shatteredspace.esm:072BA1": {
    "label": "Ridgeline Watchtower",
    "previous": "Ridgeline Watchtower — Exterior (0, 1)"
  },
  "shatteredspace.esm:072BA4": {
    "label": "Ridgeline Watchtower",
    "previous": "Ridgeline Watchtower — Exterior (1, 0)"
  },
  "shatteredspace.esm:072BA5": {
    "label": "Ridgeline Watchtower",
    "previous": "Ridgeline Watchtower — Exterior (1, 1)"
  },
  "shatteredspace.esm:076302": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-9, 9)"
  },
  "shatteredspace.esm:076303": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-9, 10)"
  },
  "shatteredspace.esm:076411": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-2, -3)"
  },
  "shatteredspace.esm:079E61": {
    "label": "Deep Gorge Refinery",
    "previous": "Deep Gorge Refinery — Exterior (9, -10)"
  },
  "shatteredspace.esm:079E62": {
    "label": "Deep Gorge Refinery",
    "previous": "Deep Gorge Refinery — Exterior (9, -11)"
  },
  "shatteredspace.esm:07A0F1": {
    "label": "Abandoned Camp",
    "previous": "Abandoned Camp — Exterior (-7, 2)"
  },
  "shatteredspace.esm:07A0F2": {
    "label": "Hamadi Station",
    "previous": "Hamadi Station — Exterior (-7, 1)"
  },
  "shatteredspace.esm:07A1A8": {
    "label": "Irina's Farm",
    "previous": "Irina's Farm — Exterior (-10, 7)"
  },
  "shatteredspace.esm:07DBEC": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-7, -4)"
  },
  "shatteredspace.esm:07E0E7": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-9, -1)"
  },
  "shatteredspace.esm:07E0E8": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-9, -2)"
  },
  "shatteredspace.esm:07E0F2": {
    "label": "Hollow Bluff Depot",
    "previous": "Hollow Bluff Depot — Exterior (-10, -1)"
  },
  "shatteredspace.esm:07E0F3": {
    "label": "Hollow Bluff Depot",
    "previous": "Hollow Bluff Depot — Exterior (-10, -2)"
  },
  "shatteredspace.esm:07E0F4": {
    "label": "Hollow Bluff Depot",
    "previous": "Hollow Bluff Depot — Exterior (-11, -2)"
  },
  "shatteredspace.esm:07E0F5": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-9, -4)"
  },
  "shatteredspace.esm:07E12D": {
    "label": "Badlands Power Station",
    "previous": "Badlands Power Station — Exterior (4, 5)"
  },
  "shatteredspace.esm:07E4D2": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (1, 1)"
  },
  "shatteredspace.esm:080404": {
    "label": "Shadow Station Epsilon",
    "previous": "Shadow Station Epsilon — Exterior (3, 10)"
  },
  "shatteredspace.esm:084C25": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (3, -3)"
  },
  "shatteredspace.esm:084C26": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (2, -3)"
  },
  "shatteredspace.esm:0870FD": {
    "label": "Shadow Station Epsilon",
    "previous": "Shadow Station Epsilon — Exterior (2, 10)"
  },
  "shatteredspace.esm:0884EA": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (7, 1)"
  },
  "shatteredspace.esm:089A57": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-5, -6)"
  },
  "shatteredspace.esm:08CC27": {
    "label": "Control Site Kappa",
    "previous": "Control Site Kappa — Exterior (-3, -8)"
  },
  "shatteredspace.esm:08D5F3": {
    "label": "Control Site Kappa",
    "previous": "Control Site Kappa — Exterior (-5, -9)"
  },
  "shatteredspace.esm:08D5F4": {
    "label": "Control Site Kappa",
    "previous": "Control Site Kappa — Exterior (-4, -9)"
  },
  "shatteredspace.esm:08D5F5": {
    "label": "Control Site Kappa",
    "previous": "Control Site Kappa — Exterior (-4, -8)"
  },
  "shatteredspace.esm:08D5F6": {
    "label": "Control Site Kappa",
    "previous": "Control Site Kappa — Exterior (-5, -7)"
  },
  "shatteredspace.esm:08D5F7": {
    "label": "Control Site Kappa",
    "previous": "Control Site Kappa — Exterior (-4, -7)"
  },
  "shatteredspace.esm:08E4F0": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (2, -2)"
  },
  "shatteredspace.esm:0901AA": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (2, 4)"
  },
  "shatteredspace.esm:090BC6": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-3, -10)"
  },
  "shatteredspace.esm:0969CC": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (5, -3)"
  },
  "shatteredspace.esm:0969CD": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (4, -3)"
  },
  "shatteredspace.esm:09F625": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-3, -7)"
  },
  "shatteredspace.esm:0A3BC3": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (2, -5)"
  },
  "shatteredspace.esm:0A5047": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-3, -5)"
  },
  "shatteredspace.esm:0A8B3E": {
    "label": "Dazra Groat Farms",
    "previous": "Dazra Groat Farms — Exterior (1, -5)"
  },
  "shatteredspace.esm:0AAB07": {
    "label": "Oasis Watch Tower",
    "previous": "Oasis Watch Tower — Exterior (1, 0)"
  },
  "shatteredspace.esm:0B67AD": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-8, 5)"
  },
  "shatteredspace.esm:0BD506": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (6, 4)"
  },
  "shatteredspace.esm:0BEDD3": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-3, -6)"
  },
  "shatteredspace.esm:0C6AF0": {
    "label": "Dazra Seaweed Farms",
    "previous": "Dazra Seaweed Farms — Exterior (-4, 1)"
  },
  "shatteredspace.esm:0CB024": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (-6, 4)"
  },
  "shatteredspace.esm:0CBA41": {
    "label": "Dazra Outskirts",
    "previous": "Dazra Outskirts — Exterior (3, 6)"
  },
  "shatteredspace.esm:0CDD21": {
    "label": "Badlands Power Relay",
    "previous": "Badlands Power Relay — Exterior (-4, 6)"
  },
  "shatteredspace.esm:0EDF49": {
    "label": "Dazra Outskirts",
    "previous": "SFBGS001OE01Ext01"
  },
  "shatteredspace.esm:0EDF4B": {
    "label": "Dazra Outskirts",
    "previous": "SFBGS001OE01Ext03"
  },
  "shatteredspace.esm:0EDF4C": {
    "label": "Dazra Outskirts",
    "previous": "SFBGS001OE01Ext02"
  },
  "shatteredspace.esm:0EDF4D": {
    "label": "Dazra Outskirts",
    "previous": "SFBGS001OE01Ext04"
  },
  "shatteredspace.esm:0F0128": {
    "label": "Hoodoo Rock Camp",
    "previous": "Hoodoo Rock Camp — Exterior (-1, 0)"
  },
  "shatteredspace.esm:10E348": {
    "label": "Anomalous Cave",
    "previous": "Anomalous Cave — Interior"
  },
  "shatteredspace.esm:11A138": {
    "label": "Hermit Groat Farm",
    "previous": "Hermit Groat Farm — Exterior (-2, -3)"
  },
  "shatteredspace.esm:15568E": {
    "label": "Courier Center",
    "previous": "Courier Center — Exterior (-5, -1)"
  },
  "starfield.esm:292A68": {
    "label": "Autonomous Staryard",
    "previous": "Shipyard"
  },
  "sfbgs00d.esm:00D26C": {
    "label": "Travel Stop",
    "previous": "SFBGS00DPOIGN01Ext"
  },
  "shatteredspace.esm:078F18": {
    "label": "Sniper Nest",
    "previous": "Sniper Nest — Exterior (4, 0)"
  },
  "shatteredspace.esm:078F1A": {
    "label": "Sniper Nest",
    "previous": "Sniper Nest — Exterior (4, -1)"
  },
  "shatteredspace.esm:0ABDE1": {
    "label": "Spacer Crash Site",
    "previous": "Spacer Crash Site — Exterior (-5, 7)"
  },
  "shatteredspace.esm:04C200": {
    "label": "Spacer Crash Site",
    "previous": "Spacer Crash Site — Exterior (-6, 7)"
  },
  "shatteredspace.esm:057484": {
    "label": "Subterranean Mal'siir Farm",
    "previous": "Subterranean Mal'siir Farm — Exterior (3, -5)"
  },
  "shatteredspace.esm:076312": {
    "label": "Subterranean Mal'siir Farm",
    "previous": "Subterranean Mal'siir Farm — Exterior (4, -6)"
  },
  "shatteredspace.esm:07807C": {
    "label": "Subterranean Mal'siir Farm",
    "previous": "Subterranean Mal'siir Farm — Exterior (4, -7)"
  },
  "shatteredspace.esm:07807B": {
    "label": "Subterranean Mal'siir Farm",
    "previous": "Subterranean Mal'siir Farm — Exterior (5, -7)"
  },
  "shatteredspace.esm:030F74": {
    "label": "Subterranean Mal'siir Farm",
    "previous": "Subterranean Malsiir Farm"
  },
  "shatteredspace.esm:04C1E6": {
    "label": "Sundered Stone Depot",
    "previous": "Sundered Stone Depot — Exterior (6, 8)"
  },
  "starfield.esm:2BF352": {
    "label": "SY-920 - Cargo Bay II",
    "previous": "SY-920 - Cargo Bay 2"
  },
  "starfield.esm:28D279": {
    "label": "SY-920 - Engineering Bay IV",
    "previous": "SY-920 - Engineering Bay 4"
  },
  "shatteredspace.esm:078F1B": {
    "label": "Target Range",
    "previous": "Target Range — Exterior (4, -2)"
  },
  "starfield.esm:00115F": {
    "label": "Neon: The Emporium",
    "previous": "The Emporium"
  },
  "shatteredspace.esm:0C6AF8": {
    "label": "Tomb of the Fang",
    "previous": "Tomb of the Fang — Exterior (-10, -7)"
  },
  "starfield.esm:1A0B99": {
    "label": "The Trade Authority",
    "previous": "Trade Authority"
  },
  "shatteredspace.esm:07F1FF": {
    "label": "Tul'Shahk Monastery",
    "previous": "Tul'Shahk Monastery — Exterior (8, 10)"
  },
  "shatteredspace.esm:07F200": {
    "label": "Tul'Shahk Monastery",
    "previous": "Tul'Shahk Monastery — Exterior (8, 9)"
  },
  "shatteredspace.esm:05B194": {
    "label": "Tul'Shahk Monastery",
    "previous": "Tul'Shahk Monastery — Exterior (9, 10)"
  },
  "shatteredspace.esm:07F1FD": {
    "label": "Tul'Shahk Monastery",
    "previous": "Tul'Shahk Monastery — Exterior (9, 9)"
  },
  "starfield.esm:25C678": {
    "label": "UC Distribution Center",
    "previous": "UC Distribution"
  },
  "starfield.esm:267B61": {
    "label": "Starstation UCN-48",
    "previous": "UCN-48"
  },
  "shatteredspace.esm:04C1DF": {
    "label": "Vaifala Crash Site",
    "previous": "Vaifala Crash Site — Exterior (2, -11)"
  },
  "starfield.esm:2C5400": {
    "label": "Vanguard Recruitment Center",
    "previous": "Vanguard Orientation Hall"
  },
  "starfield.esm:2BF4E6": {
    "label": "Neon: Hotel Volii",
    "previous": "Volii Hotel"
  },
  "starfield.esm:2BF5F8": {
    "label": "Neon: Warehouse",
    "previous": "Warehouse 01"
  },
  "starfield.esm:2BF600": {
    "label": "Neon: Warehouse",
    "previous": "Warehouse 02"
  },
  "starfield.esm:2BF603": {
    "label": "Neon: Warehouse",
    "previous": "Warehouse 03"
  },
  "starfield.esm:045647": {
    "label": "Neon: Warehouse",
    "previous": "Warehouse 04"
  },
  "shatteredspace.esm:00EF82": {
    "label": "Misthaze Cavern",
    "previous": "Waterfall Cave"
  },
  "shatteredspace.esm:04C1F2": {
    "label": "Wayshrine of Devotion",
    "previous": "Wayshrine of Devotion — Exterior (8, 3)"
  },
  "shatteredspace.esm:0740A1": {
    "label": "Wayshrine of Obedience",
    "previous": "Wayshrine of Obedience — Exterior (-1, 8)"
  },
  "shatteredspace.esm:0740A0": {
    "label": "Wayshrine of Obedience",
    "previous": "Wayshrine of Obedience — Exterior (-1, 9)"
  },
  "shatteredspace.esm:04C1FE": {
    "label": "Wayshrine of Obedience",
    "previous": "Wayshrine of Obedience — Exterior (0, 8)"
  },
  "shatteredspace.esm:04C1FD": {
    "label": "Wayshrine of Obedience",
    "previous": "Wayshrine of Obedience — Exterior (0, 9)"
  },
  "shatteredspace.esm:074099": {
    "label": "Wayshrine of Perseverance",
    "previous": "Wayshrine of Perseverance — Exterior (-10, 3)"
  },
  "shatteredspace.esm:04C1F9": {
    "label": "Wayshrine of Perseverance",
    "previous": "Wayshrine of Perseverance — Exterior (-11, 3)"
  },
  "shatteredspace.esm:04873A": {
    "label": "Wayshrine of Redemption",
    "previous": "Wayshrine of Redemption — Exterior (1, 2)"
  },
  "shatteredspace.esm:075F99": {
    "label": "Wayshrine of Strength",
    "previous": "Wayshrine of Strength — Exterior (-1, -9)"
  },
  "shatteredspace.esm:04C1EE": {
    "label": "Wayshrine of Strength",
    "previous": "Wayshrine of Strength — Exterior (0, -9)"
  },
  "sfbgs00d.esm:0079E6": {
    "label": "Wildlife Viewing Station",
    "previous": "Wildlife Viewing Station — Exterior (0, 0)"
  },
  "starfield.esm:144F82": {
    "label": "Xenofresh Fisheries",
    "previous": "Xenofresh Fisheries Factory"
  }
};
const REFERENCES=new Set([
  "sfbgs00d.esm:00243D",
  "sfbgs00d.esm:00243E",
  "sfbgs00d.esm:00243F",
  "sfbgs00d.esm:002442",
  "sfbgs00d.esm:004C38",
  "sfbgs00d.esm:004C3B",
  "sfbgs00d.esm:004C3C",
  "sfbgs00d.esm:004C3D",
  "sfbgs00d.esm:006F69",
  "sfbgs00d.esm:007298",
  "sfbgs00d.esm:0076E4",
  "sfbgs00d.esm:007B6A",
  "sfbgs00d.esm:00873F",
  "sfbgs00d.esm:008DD3",
  "sfbgs00d.esm:008EC2",
  "sfbgs00d.esm:0094CE",
  "sfbgs00d.esm:0094CF",
  "sfbgs00d.esm:0094D0",
  "sfbgs00d.esm:0094DC",
  "sfbgs00d.esm:00A677",
  "sfbgs00d.esm:00AA25",
  "sfbgs00d.esm:00D26B",
  "sfbgs00d.esm:00D26C",
  "sfbgs00d.esm:00E074",
  "sfbgs00d.esm:00E075",
  "sfbgs00d.esm:00E076",
  "sfbgs00d.esm:00E077",
  "sfbgs00d.esm:00EF40",
  "sfbgs00d.esm:011373",
  "sfbgs00d.esm:011662",
  "sfbgs00d.esm:016D49",
  "sfbgs00d.esm:020482",
  "sfbgs00d.esm:023B66",
  "sfbgs00d.esm:02489D",
  "sfbgs00d.esm:025686",
  "sfbgs00d.esm:025687",
  "sfbgs00d.esm:02A3BC",
  "sfbgs00d.esm:02A3BD",
  "sfbgs00d.esm:02A3BE",
  "sfbgs00d.esm:02A3C0",
  "sfbgs00d.esm:02B9D0",
  "sfbgs00d.esm:02B9D1",
  "sfbgs00d.esm:02B9D2",
  "sfbgs00d.esm:02B9D3",
  "sfbgs00d.esm:030774",
  "sfbgs00d.esm:030776",
  "sfbgs00d.esm:030777",
  "sfbgs00d.esm:030778",
  "sfbgs00d.esm:03077A",
  "sfbgs00d.esm:03077B",
  "sfbgs00d.esm:03077C",
  "sfbgs00d.esm:03077D",
  "sfbgs00d.esm:03077E",
  "sfbgs00d.esm:036F66",
  "sfbgs00d.esm:036F6A",
  "sfbgs00d.esm:036F6B",
  "sfbgs00d.esm:036F6E",
  "sfbgs00d.esm:0373C3",
  "sfbgs00d.esm:03D1C8",
  "sfbgs00d.esm:044616",
  "sfbgs00d.esm:044B2D",
  "sfbgs00d.esm:044B2E",
  "sfbgs00d.esm:046856",
  "sfbgs00d.esm:04A287",
  "sfbgs00d.esm:04A289",
  "sfbgs00d.esm:04B50B",
  "sfbgs00d.esm:04B50D",
  "sfbgs00d.esm:0525DA",
  "sfbgs00d.esm:0525DB",
  "sfbgs00d.esm:0525DD",
  "sfbgs00d.esm:0525DE",
  "sfbgs00d.esm:0525DF",
  "sfbgs00d.esm:05DC00",
  "sfbgs00d.esm:084B0A",
  "sfbgs00d.esm:085E7E",
  "sfbgs00d.esm:086257",
  "sfbgs050.esm:005B51",
  "sfbgs050.esm:005B52",
  "sfbgs050.esm:00F9F6",
  "sfbgs050.esm:014BB2",
  "sfbgs050.esm:014BB3",
  "sfbgs050.esm:01931B",
  "sfbgs050.esm:01AB8E",
  "sfbgs050.esm:01AB8F",
  "sfbgs050.esm:01B11D",
  "sfbgs050.esm:02B00A",
  "sfbgs050.esm:02B00B",
  "sfbgs050.esm:02B00E",
  "sfbgs050.esm:02B010",
  "sfbgs050.esm:02B036",
  "sfbgs050.esm:02B037",
  "sfbgs050.esm:02B03E",
  "sfbgs050.esm:02B03F",
  "sfbgs050.esm:02B074",
  "sfbgs050.esm:02B078",
  "sfbgs050.esm:02B079",
  "sfbgs050.esm:02B07B",
  "sfbgs050.esm:02B45B",
  "sfbgs050.esm:02B45C",
  "sfbgs050.esm:02BA0A",
  "sfbgs050.esm:02BA0B",
  "sfbgs050.esm:02BA0C",
  "sfbgs050.esm:02BA0D",
  "sfbgs050.esm:02BBA7",
  "sfbgs050.esm:02BBA8",
  "sfbgs050.esm:02BBA9",
  "sfbgs050.esm:02BBAB",
  "sfbgs050.esm:02BBAC",
  "sfbgs050.esm:02BBAE",
  "sfbgs050.esm:02BBAF",
  "sfbgs050.esm:02BBB0",
  "sfbgs050.esm:02BBB1",
  "sfbgs050.esm:034613",
  "sfbgs050.esm:034614",
  "sfbgs050.esm:034615",
  "sfbgs050.esm:034616",
  "sfbgs050.esm:034617",
  "sfbgs050.esm:034618",
  "sfbgs050.esm:034619",
  "sfbgs050.esm:03461A",
  "sfbgs050.esm:03461B",
  "sfbgs050.esm:03461C",
  "sfbgs050.esm:03461D",
  "sfbgs050.esm:03461E",
  "sfbgs050.esm:03461F",
  "sfbgs050.esm:034620",
  "sfbgs050.esm:034621",
  "sfbgs050.esm:034622",
  "sfbgs050.esm:034623",
  "sfbgs050.esm:034624",
  "sfbgs050.esm:034625",
  "sfbgs050.esm:034626",
  "sfbgs050.esm:034627",
  "sfbgs050.esm:034628",
  "sfbgs050.esm:034629",
  "sfbgs050.esm:03462A",
  "sfbgs050.esm:03462B",
  "sfbgs050.esm:03462C",
  "sfbgs050.esm:03462D",
  "sfbgs050.esm:03462E",
  "sfbgs050.esm:03462F",
  "sfbgs050.esm:034630",
  "sfbgs050.esm:034631",
  "sfbgs050.esm:034632",
  "sfbgs050.esm:034633",
  "sfbgs050.esm:034634",
  "sfbgs050.esm:034635",
  "sfbgs050.esm:034636",
  "sfbgs050.esm:03552D",
  "sfbgs050.esm:0743FA",
  "sfbgs050.esm:074DB0",
  "sfbgs050.esm:075124",
  "sfbgs050.esm:0AD143",
  "sfbgs050.esm:0AD144",
  "sfbgs050.esm:0AF093",
  "shatteredspace.esm:00849D",
  "shatteredspace.esm:024C03",
  "shatteredspace.esm:03AB72",
  "shatteredspace.esm:03ABBC",
  "shatteredspace.esm:04C1DC",
  "shatteredspace.esm:05F5D7",
  "shatteredspace.esm:072BA2",
  "shatteredspace.esm:076313",
  "shatteredspace.esm:07E06C",
  "shatteredspace.esm:0C6406",
  "shatteredspace.esm:0CB674",
  "shatteredspace.esm:0E03A2",
  "shatteredspace.esm:0E3D87",
  "shatteredspace.esm:0E8151",
  "shatteredspace.esm:0EC3F6",
  "shatteredspace.esm:0EECE0",
  "shatteredspace.esm:0EECE1",
  "shatteredspace.esm:0EECE2",
  "shatteredspace.esm:0F0129",
  "shatteredspace.esm:0F4144",
  "shatteredspace.esm:0F4145",
  "shatteredspace.esm:0F4147",
  "shatteredspace.esm:0F4148",
  "shatteredspace.esm:0F566C",
  "shatteredspace.esm:0F57A9",
  "shatteredspace.esm:0F6F73",
  "shatteredspace.esm:0F6F74",
  "shatteredspace.esm:0F6F76",
  "shatteredspace.esm:0F715F",
  "shatteredspace.esm:0F7160",
  "shatteredspace.esm:0F7161",
  "shatteredspace.esm:0F7163",
  "shatteredspace.esm:0F9C58",
  "shatteredspace.esm:0F9C59",
  "shatteredspace.esm:0F9C5D",
  "shatteredspace.esm:106FB8",
  "shatteredspace.esm:106FB9",
  "shatteredspace.esm:106FBA",
  "shatteredspace.esm:106FBB",
  "shatteredspace.esm:1081EE",
  "shatteredspace.esm:1081EF",
  "shatteredspace.esm:1081F0",
  "shatteredspace.esm:1081F1",
  "shatteredspace.esm:109AD4",
  "shatteredspace.esm:109AD5",
  "shatteredspace.esm:109AD7",
  "shatteredspace.esm:109AD9",
  "shatteredspace.esm:10B19B",
  "shatteredspace.esm:10B19C",
  "shatteredspace.esm:10B19D",
  "shatteredspace.esm:10B19E",
  "shatteredspace.esm:1116C1",
  "shatteredspace.esm:1116F9",
  "shatteredspace.esm:1116FA",
  "shatteredspace.esm:1116FC",
  "starfield.esm:012859",
  "starfield.esm:01410A",
  "starfield.esm:01410B",
  "starfield.esm:03274D",
  "starfield.esm:03DBEC",
  "starfield.esm:09306A",
  "starfield.esm:0B211F",
  "starfield.esm:0C70F5",
  "starfield.esm:0C70F6",
  "starfield.esm:0C70F7",
  "starfield.esm:0C70F8",
  "starfield.esm:0C70F9",
  "starfield.esm:0C70FA",
  "starfield.esm:0C70FB",
  "starfield.esm:0C70FC",
  "starfield.esm:0C70FD",
  "starfield.esm:0C70FE",
  "starfield.esm:0C70FF",
  "starfield.esm:0C7100",
  "starfield.esm:0C7101",
  "starfield.esm:0C7102",
  "starfield.esm:0C7103",
  "starfield.esm:13E4AB",
  "starfield.esm:19B078",
  "starfield.esm:1AD849",
  "starfield.esm:1D7041",
  "starfield.esm:1D704D",
  "starfield.esm:1EE4D0",
  "starfield.esm:1EF7F0",
  "starfield.esm:203B4E",
  "starfield.esm:21EBE5",
  "starfield.esm:234476",
  "starfield.esm:235907",
  "starfield.esm:2373EB",
  "starfield.esm:237627",
  "starfield.esm:23858F",
  "starfield.esm:24CBC4",
  "starfield.esm:25B225",
  "starfield.esm:25CAA7",
  "starfield.esm:25E0EF",
  "starfield.esm:2662DE",
  "starfield.esm:269580",
  "starfield.esm:27032E",
  "starfield.esm:274274",
  "starfield.esm:2959A0",
  "starfield.esm:2ABFCD",
  "starfield.esm:2B4AB3",
  "starfield.esm:2CC103",
  "starfield.esm:2D7398"
]);
const TESTED=new Set([
  "sfbgs00d.esm:00243D",
  "sfbgs00d.esm:00243E",
  "sfbgs00d.esm:00243F",
  "sfbgs00d.esm:002442",
  "sfbgs00d.esm:003A32",
  "sfbgs00d.esm:003A33",
  "sfbgs00d.esm:003A34",
  "sfbgs00d.esm:003A36",
  "sfbgs00d.esm:004C38",
  "sfbgs00d.esm:004C3B",
  "sfbgs00d.esm:004C3C",
  "sfbgs00d.esm:004C3D",
  "sfbgs00d.esm:006F69",
  "sfbgs00d.esm:007298",
  "sfbgs00d.esm:0076E4",
  "sfbgs00d.esm:007B6A",
  "sfbgs00d.esm:00873F",
  "sfbgs00d.esm:008DD3",
  "sfbgs00d.esm:008EC2",
  "sfbgs00d.esm:0094CE",
  "sfbgs00d.esm:0094CF",
  "sfbgs00d.esm:0094D0",
  "sfbgs00d.esm:0094DC",
  "sfbgs00d.esm:00A677",
  "sfbgs00d.esm:00AA25",
  "sfbgs00d.esm:00BF39",
  "sfbgs00d.esm:00BF3A",
  "sfbgs00d.esm:00CBD5",
  "sfbgs00d.esm:00CBDB",
  "sfbgs00d.esm:00D26B",
  "sfbgs00d.esm:00D26C",
  "sfbgs00d.esm:00E074",
  "sfbgs00d.esm:00E075",
  "sfbgs00d.esm:00E076",
  "sfbgs00d.esm:00E077",
  "sfbgs00d.esm:00EF40",
  "sfbgs00d.esm:011373",
  "sfbgs00d.esm:011662",
  "sfbgs00d.esm:016D49",
  "sfbgs00d.esm:020482",
  "sfbgs00d.esm:023B66",
  "sfbgs00d.esm:02489D",
  "sfbgs00d.esm:0248A4",
  "sfbgs00d.esm:025686",
  "sfbgs00d.esm:025687",
  "sfbgs00d.esm:02A3BC",
  "sfbgs00d.esm:02A3BD",
  "sfbgs00d.esm:02A3BE",
  "sfbgs00d.esm:02A3C0",
  "sfbgs00d.esm:02B9D0",
  "sfbgs00d.esm:02B9D1",
  "sfbgs00d.esm:02B9D2",
  "sfbgs00d.esm:02B9D3",
  "sfbgs00d.esm:030774",
  "sfbgs00d.esm:030776",
  "sfbgs00d.esm:030777",
  "sfbgs00d.esm:030778",
  "sfbgs00d.esm:03077A",
  "sfbgs00d.esm:03077B",
  "sfbgs00d.esm:03077C",
  "sfbgs00d.esm:03077D",
  "sfbgs00d.esm:03077E",
  "sfbgs00d.esm:036F66",
  "sfbgs00d.esm:036F6A",
  "sfbgs00d.esm:036F6B",
  "sfbgs00d.esm:036F6E",
  "sfbgs00d.esm:0373C3",
  "sfbgs00d.esm:03D1C8",
  "sfbgs00d.esm:044616",
  "sfbgs00d.esm:044B2D",
  "sfbgs00d.esm:044B2E",
  "sfbgs00d.esm:046428",
  "sfbgs00d.esm:046856",
  "sfbgs00d.esm:049D90",
  "sfbgs00d.esm:04A287",
  "sfbgs00d.esm:04A289",
  "sfbgs00d.esm:04B50B",
  "sfbgs00d.esm:04B50D",
  "sfbgs00d.esm:0525DA",
  "sfbgs00d.esm:0525DB",
  "sfbgs00d.esm:0525DD",
  "sfbgs00d.esm:0525DE",
  "sfbgs00d.esm:0525DF",
  "sfbgs00d.esm:05DC00",
  "sfbgs00d.esm:084B0A",
  "sfbgs00d.esm:085E7E",
  "sfbgs00d.esm:086257",
  "sfbgs050.esm:005B51",
  "sfbgs050.esm:005B52",
  "sfbgs050.esm:00F9F6",
  "sfbgs050.esm:014BB2",
  "sfbgs050.esm:014BB3",
  "sfbgs050.esm:014BB4",
  "sfbgs050.esm:01931B",
  "sfbgs050.esm:01AB8E",
  "sfbgs050.esm:01AB8F",
  "sfbgs050.esm:01B11D",
  "sfbgs050.esm:02B00A",
  "sfbgs050.esm:02B00B",
  "sfbgs050.esm:02B00E",
  "sfbgs050.esm:02B010",
  "sfbgs050.esm:02B036",
  "sfbgs050.esm:02B037",
  "sfbgs050.esm:02B03E",
  "sfbgs050.esm:02B03F",
  "sfbgs050.esm:02B074",
  "sfbgs050.esm:02B078",
  "sfbgs050.esm:02B079",
  "sfbgs050.esm:02B07B",
  "sfbgs050.esm:02B45B",
  "sfbgs050.esm:02B45C",
  "sfbgs050.esm:02BA0A",
  "sfbgs050.esm:02BA0B",
  "sfbgs050.esm:02BA0C",
  "sfbgs050.esm:02BA0D",
  "sfbgs050.esm:02BBA7",
  "sfbgs050.esm:02BBA8",
  "sfbgs050.esm:02BBA9",
  "sfbgs050.esm:02BBAB",
  "sfbgs050.esm:02BBAC",
  "sfbgs050.esm:02BBAE",
  "sfbgs050.esm:02BBAF",
  "sfbgs050.esm:02BBB0",
  "sfbgs050.esm:02BBB1",
  "sfbgs050.esm:034613",
  "sfbgs050.esm:034614",
  "sfbgs050.esm:034615",
  "sfbgs050.esm:034616",
  "sfbgs050.esm:034617",
  "sfbgs050.esm:034618",
  "sfbgs050.esm:034619",
  "sfbgs050.esm:03461A",
  "sfbgs050.esm:03461B",
  "sfbgs050.esm:03461C",
  "sfbgs050.esm:03461D",
  "sfbgs050.esm:03461E",
  "sfbgs050.esm:03461F",
  "sfbgs050.esm:034620",
  "sfbgs050.esm:034621",
  "sfbgs050.esm:034622",
  "sfbgs050.esm:034623",
  "sfbgs050.esm:034624",
  "sfbgs050.esm:034625",
  "sfbgs050.esm:034626",
  "sfbgs050.esm:034627",
  "sfbgs050.esm:034628",
  "sfbgs050.esm:034629",
  "sfbgs050.esm:03462A",
  "sfbgs050.esm:03462B",
  "sfbgs050.esm:03462C",
  "sfbgs050.esm:03462D",
  "sfbgs050.esm:03462E",
  "sfbgs050.esm:03462F",
  "sfbgs050.esm:034630",
  "sfbgs050.esm:034631",
  "sfbgs050.esm:034632",
  "sfbgs050.esm:034633",
  "sfbgs050.esm:034634",
  "sfbgs050.esm:034635",
  "sfbgs050.esm:034636",
  "sfbgs050.esm:03552D",
  "sfbgs050.esm:038811",
  "sfbgs050.esm:0743FA",
  "sfbgs050.esm:074DB0",
  "sfbgs050.esm:075124",
  "sfbgs050.esm:0AD143",
  "sfbgs050.esm:0AD144",
  "sfbgs050.esm:0AF093",
  "shatteredspace.esm:00849D",
  "shatteredspace.esm:024C03",
  "shatteredspace.esm:030F74",
  "shatteredspace.esm:034E03",
  "shatteredspace.esm:03AB72",
  "shatteredspace.esm:03ABBC",
  "shatteredspace.esm:04100A",
  "shatteredspace.esm:046D0D",
  "shatteredspace.esm:046D0E",
  "shatteredspace.esm:0470D1",
  "shatteredspace.esm:047105",
  "shatteredspace.esm:04710B",
  "shatteredspace.esm:04710D",
  "shatteredspace.esm:0474B2",
  "shatteredspace.esm:0478D6",
  "shatteredspace.esm:0478DA",
  "shatteredspace.esm:0485D5",
  "shatteredspace.esm:0485D6",
  "shatteredspace.esm:0485D7",
  "shatteredspace.esm:0485D9",
  "shatteredspace.esm:0485DE",
  "shatteredspace.esm:0485E0",
  "shatteredspace.esm:04C1DB",
  "shatteredspace.esm:04C1DC",
  "shatteredspace.esm:04C1DD",
  "shatteredspace.esm:04C1DE",
  "shatteredspace.esm:04C1DF",
  "shatteredspace.esm:04C1E0",
  "shatteredspace.esm:04C1E1",
  "shatteredspace.esm:04C1E2",
  "shatteredspace.esm:04C1E3",
  "shatteredspace.esm:04C1E4",
  "shatteredspace.esm:04C1E6",
  "shatteredspace.esm:04C1EB",
  "shatteredspace.esm:04C1EC",
  "shatteredspace.esm:04C1ED",
  "shatteredspace.esm:04C1F1",
  "shatteredspace.esm:04C1F3",
  "shatteredspace.esm:04C1F4",
  "shatteredspace.esm:04C1F6",
  "shatteredspace.esm:04C1FA",
  "shatteredspace.esm:04C1FF",
  "shatteredspace.esm:04C200",
  "shatteredspace.esm:04C204",
  "shatteredspace.esm:04C20B",
  "shatteredspace.esm:04C24C",
  "shatteredspace.esm:04C271",
  "shatteredspace.esm:04C272",
  "shatteredspace.esm:04C276",
  "shatteredspace.esm:04C278",
  "shatteredspace.esm:04C279",
  "shatteredspace.esm:04C27A",
  "shatteredspace.esm:04C280",
  "shatteredspace.esm:050AD0",
  "shatteredspace.esm:052B30",
  "shatteredspace.esm:052B66",
  "shatteredspace.esm:057484",
  "shatteredspace.esm:057487",
  "shatteredspace.esm:05A5C0",
  "shatteredspace.esm:05ACB0",
  "shatteredspace.esm:05B192",
  "shatteredspace.esm:05B194",
  "shatteredspace.esm:05BE8F",
  "shatteredspace.esm:05D10D",
  "shatteredspace.esm:05F5D5",
  "shatteredspace.esm:05F5D7",
  "shatteredspace.esm:05F5D8",
  "shatteredspace.esm:05F6F0",
  "shatteredspace.esm:05F6F9",
  "shatteredspace.esm:06DCC4",
  "shatteredspace.esm:06DCC5",
  "shatteredspace.esm:06DCC6",
  "shatteredspace.esm:06DCC7",
  "shatteredspace.esm:070E16",
  "shatteredspace.esm:070E17",
  "shatteredspace.esm:070E18",
  "shatteredspace.esm:0717E4",
  "shatteredspace.esm:072BA1",
  "shatteredspace.esm:072BA2",
  "shatteredspace.esm:072BA4",
  "shatteredspace.esm:072BA5",
  "shatteredspace.esm:076312",
  "shatteredspace.esm:076313",
  "shatteredspace.esm:076411",
  "shatteredspace.esm:07807B",
  "shatteredspace.esm:07807C",
  "shatteredspace.esm:078F18",
  "shatteredspace.esm:078F1A",
  "shatteredspace.esm:078F1B",
  "shatteredspace.esm:079E61",
  "shatteredspace.esm:079E62",
  "shatteredspace.esm:07A0F1",
  "shatteredspace.esm:07A0F2",
  "shatteredspace.esm:07A1A8",
  "shatteredspace.esm:07DBEC",
  "shatteredspace.esm:07E06C",
  "shatteredspace.esm:07E0E7",
  "shatteredspace.esm:07E0E8",
  "shatteredspace.esm:07E0F2",
  "shatteredspace.esm:07E0F3",
  "shatteredspace.esm:07E0F4",
  "shatteredspace.esm:07E12D",
  "shatteredspace.esm:07F1FD",
  "shatteredspace.esm:07F1FF",
  "shatteredspace.esm:07F200",
  "shatteredspace.esm:080404",
  "shatteredspace.esm:0870FD",
  "shatteredspace.esm:089A57",
  "shatteredspace.esm:08CC27",
  "shatteredspace.esm:08D5F3",
  "shatteredspace.esm:08D5F4",
  "shatteredspace.esm:08D5F5",
  "shatteredspace.esm:08D5F6",
  "shatteredspace.esm:08D5F7",
  "shatteredspace.esm:090BC6",
  "shatteredspace.esm:09F625",
  "shatteredspace.esm:0A5047",
  "shatteredspace.esm:0A8B3E",
  "shatteredspace.esm:0AAB07",
  "shatteredspace.esm:0ABDE1",
  "shatteredspace.esm:0B67AD",
  "shatteredspace.esm:0BEDD3",
  "shatteredspace.esm:0C6406",
  "shatteredspace.esm:0C6AF0",
  "shatteredspace.esm:0C6AF8",
  "shatteredspace.esm:0CB024",
  "shatteredspace.esm:0CB674",
  "shatteredspace.esm:0CDD21",
  "shatteredspace.esm:0E03A2",
  "shatteredspace.esm:0E3D87",
  "shatteredspace.esm:0E8151",
  "shatteredspace.esm:0EC3F6",
  "shatteredspace.esm:0EDF49",
  "shatteredspace.esm:0EDF4B",
  "shatteredspace.esm:0EDF4C",
  "shatteredspace.esm:0EDF4D",
  "shatteredspace.esm:0EECE0",
  "shatteredspace.esm:0EECE1",
  "shatteredspace.esm:0EECE2",
  "shatteredspace.esm:0F0128",
  "shatteredspace.esm:0F0129",
  "shatteredspace.esm:0F4144",
  "shatteredspace.esm:0F4145",
  "shatteredspace.esm:0F4147",
  "shatteredspace.esm:0F4148",
  "shatteredspace.esm:0F566C",
  "shatteredspace.esm:0F57A9",
  "shatteredspace.esm:0F6F73",
  "shatteredspace.esm:0F6F74",
  "shatteredspace.esm:0F6F76",
  "shatteredspace.esm:0F715F",
  "shatteredspace.esm:0F7160",
  "shatteredspace.esm:0F7161",
  "shatteredspace.esm:0F7163",
  "shatteredspace.esm:0F9C58",
  "shatteredspace.esm:0F9C59",
  "shatteredspace.esm:0F9C5D",
  "shatteredspace.esm:106FB8",
  "shatteredspace.esm:106FB9",
  "shatteredspace.esm:106FBA",
  "shatteredspace.esm:106FBB",
  "shatteredspace.esm:1081EE",
  "shatteredspace.esm:1081EF",
  "shatteredspace.esm:1081F0",
  "shatteredspace.esm:1081F1",
  "shatteredspace.esm:109AD4",
  "shatteredspace.esm:109AD5",
  "shatteredspace.esm:109AD7",
  "shatteredspace.esm:109AD9",
  "shatteredspace.esm:10B19B",
  "shatteredspace.esm:10B19C",
  "shatteredspace.esm:10B19D",
  "shatteredspace.esm:10B19E",
  "shatteredspace.esm:10E348",
  "shatteredspace.esm:1116C1",
  "shatteredspace.esm:1116F9",
  "shatteredspace.esm:1116FA",
  "shatteredspace.esm:1116FC",
  "shatteredspace.esm:11A138",
  "shatteredspace.esm:15568E",
  "starfield.esm:00115F",
  "starfield.esm:012859",
  "starfield.esm:01410A",
  "starfield.esm:01410B",
  "starfield.esm:03274D",
  "starfield.esm:03DBEC",
  "starfield.esm:09306A",
  "starfield.esm:0B211F",
  "starfield.esm:0C70F5",
  "starfield.esm:0C70F6",
  "starfield.esm:0C70F7",
  "starfield.esm:0C70F8",
  "starfield.esm:0C70F9",
  "starfield.esm:0C70FA",
  "starfield.esm:0C70FB",
  "starfield.esm:0C70FC",
  "starfield.esm:0C70FD",
  "starfield.esm:0C70FE",
  "starfield.esm:0C70FF",
  "starfield.esm:0C7100",
  "starfield.esm:0C7101",
  "starfield.esm:0C7102",
  "starfield.esm:0C7103",
  "starfield.esm:13E4AB",
  "starfield.esm:19B078",
  "starfield.esm:1A0B99",
  "starfield.esm:1AD849",
  "starfield.esm:1D7041",
  "starfield.esm:1D704D",
  "starfield.esm:1EE4D0",
  "starfield.esm:1EF7F0",
  "starfield.esm:203B4E",
  "starfield.esm:21EBE5",
  "starfield.esm:234476",
  "starfield.esm:235907",
  "starfield.esm:2373EB",
  "starfield.esm:237627",
  "starfield.esm:23858F",
  "starfield.esm:24CBC4",
  "starfield.esm:25B225",
  "starfield.esm:25C678",
  "starfield.esm:25CAA7",
  "starfield.esm:25E0EF",
  "starfield.esm:2662DE",
  "starfield.esm:267B61",
  "starfield.esm:269580",
  "starfield.esm:27032E",
  "starfield.esm:274274",
  "starfield.esm:28D279",
  "starfield.esm:292A68",
  "starfield.esm:2959A0",
  "starfield.esm:2ABFCD",
  "starfield.esm:2B4AB3",
  "starfield.esm:2BF352",
  "starfield.esm:2BF4E6",
  "starfield.esm:2C5400",
  "starfield.esm:2CC103",
  "starfield.esm:2D7398",
  "starfield.esm:2BF5F8",
  "starfield.esm:2BF600",
  "starfield.esm:2BF603",
  "starfield.esm:045647",
  "shatteredspace.esm:00EF82",
  "shatteredspace.esm:04C1F2",
  "shatteredspace.esm:0740A1",
  "shatteredspace.esm:0740A0",
  "shatteredspace.esm:04C1FE",
  "shatteredspace.esm:04C1FD",
  "shatteredspace.esm:074099",
  "shatteredspace.esm:04C1F9",
  "shatteredspace.esm:04873A",
  "shatteredspace.esm:075F99",
  "shatteredspace.esm:04C1EE",
  "sfbgs00d.esm:0079E6",
  "starfield.esm:144F82"
]);
function key(record:{value:string;plugin?:string;localFormId?:string}):string{return (record.plugin??'Starfield.esm').toLowerCase()+':'+(record.localFormId??record.value).toUpperCase().slice(-6).padStart(6,'0');}
export function reportedCellReference(record:{type?:string;value:string;plugin?:string;localFormId?:string}):boolean{return record.type?.toUpperCase()==='CELL'&&REFERENCES.has(key(record));}
export function reportedCellWasTested(record:{type?:string;value:string;plugin?:string;localFormId?:string}):boolean{return record.type?.toUpperCase()==='CELL'&&TESTED.has(key(record));}
export function applyReportedCellName<T extends CellRecord>(record:T):T {
 if(record.type?.toUpperCase()!=='CELL')return record;
 const name=NAMES[key(record)];if(!name)return record;
 return {...record,label:name.label,originalName:record.originalName??record.label,keywords:[...new Set([...(record.keywords??[]),name.previous,...(record.label!==name.label?[record.label]:[]),record.originalName??record.label])]};
}
