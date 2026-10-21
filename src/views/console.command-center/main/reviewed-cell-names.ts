import { applyReportedCellName } from './reviewed-cell-feedback.ts';
// Exact CELL identities resolved from English LCTN/WRLD names in the installed official masters.
// Location scope and exterior coordinates distinguish cells without inventing landmarks.
const NAMES: Record<string,{label:string;original:string}> = {
  "shatteredspace.esm:0C6406": {
    "label": "Test Interior Location — Alias Cell",
    "original": "SFBGS001 Alias Cell"
  },
  "shatteredspace.esm:0485DB": {
    "label": "Dazra Outskirts — Exterior (2, 2)",
    "original": "SFBGS001Crater01"
  },
  "shatteredspace.esm:0CBA41": {
    "label": "Dazra Outskirts — Exterior (3, 6)",
    "original": "SFBGS001Dazra OE01"
  },
  "shatteredspace.esm:04C1EC": {
    "label": "Cave — Exterior (-10, -9)",
    "original": "SFBGS001Dazra OE02"
  },
  "shatteredspace.esm:06DCC8": {
    "label": "Dazra Outskirts — Exterior (7, -6)",
    "original": "SFBGS001Dazra OE03"
  },
  "shatteredspace.esm:0717E4": {
    "label": "Dazra Outskirts — Exterior (8, 2)",
    "original": "SFBGS001Dazra OE04"
  },
  "shatteredspace.esm:0BD506": {
    "label": "Dazra Outskirts — Exterior (6, 4)",
    "original": "SFBGS001Dazra OE05"
  },
  "shatteredspace.esm:05F6F0": {
    "label": "Dazra Outskirts — Exterior (-1, 6)",
    "original": "SFBGS001Dazra OE06"
  },
  "shatteredspace.esm:05ACB1": {
    "label": "Dazra Outskirts — Exterior (8, -3)",
    "original": "SFBGS001Dazra OE07"
  },
  "shatteredspace.esm:0475F1": {
    "label": "Dazra Outskirts — Exterior (8, -9)",
    "original": "SFBGS001Dazra OE08"
  },
  "shatteredspace.esm:0BEDD3": {
    "label": "Dazra Outskirts — Exterior (-3, -6)",
    "original": "SFBGS001Dazra OE09"
  },
  "shatteredspace.esm:07DBEC": {
    "label": "Dazra Outskirts — Exterior (-7, -4)",
    "original": "SFBGS001Dazra OE10"
  },
  "shatteredspace.esm:07E0F5": {
    "label": "Dazra Outskirts — Exterior (-9, -4)",
    "original": "SFBGS001Dazra OE11"
  },
  "shatteredspace.esm:0478D6": {
    "label": "Dazra Outskirts — Exterior (-7, -9)",
    "original": "SFBGS001Dazra OE12"
  },
  "shatteredspace.esm:047107": {
    "label": "Dazra Outskirts — Exterior (6, -8)",
    "original": "SFBGS001Dazra OE13"
  },
  "shatteredspace.esm:06871F": {
    "label": "Dazra Outskirts — Exterior (2, -9)",
    "original": "SFBGS001Dazra OE14"
  },
  "shatteredspace.esm:076411": {
    "label": "Dazra Outskirts — Exterior (-2, -3)",
    "original": "SFBGS001Dazra OE15Ext"
  },
  "shatteredspace.esm:07E4D2": {
    "label": "Dazra Outskirts — Exterior (1, 1)",
    "original": "SFBGS001Dazra OE16Ext"
  },
  "shatteredspace.esm:034E03": {
    "label": "Dazra Outskirts — Exterior (-3, 3)",
    "original": "SFBGS001Dazra OE17Ext"
  },
  "shatteredspace.esm:0A5047": {
    "label": "Dazra Outskirts — Exterior (-3, -5)",
    "original": "SFBGS001Dazra OE18Ext"
  },
  "shatteredspace.esm:0A3BC3": {
    "label": "Dazra Outskirts — Exterior (2, -5)",
    "original": "SFBGS001Dazra OE19Ext"
  },
  "shatteredspace.esm:036B44": {
    "label": "Dazra Outskirts — Exterior (1, 3)",
    "original": "SFBGS001Dazra OE20Ext"
  },
  "shatteredspace.esm:080404": {
    "label": "Shadow Station Epsilon — Exterior (3, 10)",
    "original": "SFBGS001LC03Ext"
  },
  "shatteredspace.esm:04C1DB": {
    "label": "Shadow Station Epsilon — Exterior (3, 9)",
    "original": "SFBGS001LC03Ext02"
  },
  "shatteredspace.esm:0870FD": {
    "label": "Shadow Station Epsilon — Exterior (2, 10)",
    "original": "SFBGS001LC03Ext03"
  },
  "shatteredspace.esm:04C1F4": {
    "label": "Apostate's Refuge — Exterior (-10, 9)",
    "original": "SFBGS001LC04Ext"
  },
  "shatteredspace.esm:076302": {
    "label": "Dazra Outskirts — Exterior (-9, 9)",
    "original": "SFBGS001LC04Ext02"
  },
  "shatteredspace.esm:076303": {
    "label": "Dazra Outskirts — Exterior (-9, 10)",
    "original": "SFBGS001LC04Ext03"
  },
  "shatteredspace.esm:04710B": {
    "label": "Ma'leen Dam — Exterior (9, -5)",
    "original": "SFBGS001LC05Ext"
  },
  "shatteredspace.esm:05ACB0": {
    "label": "Ma'leen Dam — Exterior (9, -6)",
    "original": "SFBGS001LC05Ext02"
  },
  "shatteredspace.esm:05ACB4": {
    "label": "Dazra Outskirts — Exterior (8, -6)",
    "original": "SFBGS001LC05Ext03"
  },
  "shatteredspace.esm:05ACB3": {
    "label": "Dazra Outskirts — Exterior (8, -5)",
    "original": "SFBGS001LC05Ext04"
  },
  "shatteredspace.esm:0470D1": {
    "label": "Scaled Citadel — Exterior (3, 0)",
    "original": "SFBGS001LC06Ext"
  },
  "shatteredspace.esm:0485E0": {
    "label": "Scaled Citadel — Exterior (3, -1)",
    "original": "SFBGS001LC06Ext02"
  },
  "shatteredspace.esm:0485D6": {
    "label": "Scaled Citadel — Exterior (4, 0)",
    "original": "SFBGS001LC06Ext03"
  },
  "shatteredspace.esm:0485D9": {
    "label": "Scaled Citadel — Exterior (3, 1)",
    "original": "SFBGS001LC06Ext04"
  },
  "shatteredspace.esm:0485D5": {
    "label": "Scaled Citadel — Exterior (4, 1)",
    "original": "SFBGS001LC06Ext05"
  },
  "shatteredspace.esm:04710D": {
    "label": "Deep Gorge Refinery — Exterior (10, -10)",
    "original": "SFBGS001LC07Ext"
  },
  "shatteredspace.esm:0474B2": {
    "label": "Deep Gorge Refinery — Exterior (10, -11)",
    "original": "SFBGS001LC07Ext02"
  },
  "shatteredspace.esm:079E62": {
    "label": "Deep Gorge Refinery — Exterior (9, -11)",
    "original": "SFBGS001LC07Ext03"
  },
  "shatteredspace.esm:079E61": {
    "label": "Deep Gorge Refinery — Exterior (9, -10)",
    "original": "SFBGS001LC07Ext04"
  },
  "shatteredspace.esm:04C1F3": {
    "label": "Misthaze Cavern — Exterior (7, -1)",
    "original": "SFBGS001LC08Ext"
  },
  "shatteredspace.esm:05F5D5": {
    "label": "Dazra Outskirts — Exterior (-6, 9)",
    "original": "SFBGS001LC10Ext"
  },
  "shatteredspace.esm:05F5D7": {
    "label": "Abandoned Outpost — Exterior (-5, 9)",
    "original": "SFBGS001LC10Ext02"
  },
  "shatteredspace.esm:05F5D8": {
    "label": "Abandoned Outpost — Exterior (-5, 10)",
    "original": "SFBGS001LC10Ext03"
  },
  "shatteredspace.esm:05B192": {
    "label": "Abandoned Outpost — Exterior (-4, 10)",
    "original": "SFBGS001LC10Ext04"
  },
  "shatteredspace.esm:04C20B": {
    "label": "Abandoned Outpost — Exterior (-4, 9)",
    "original": "SFBGS001LC10Ext05"
  },
  "shatteredspace.esm:04C1F6": {
    "label": "Abandoned Camp — Exterior (-8, 3)",
    "original": "SFBGS001LC12Ext01"
  },
  "shatteredspace.esm:07A0F1": {
    "label": "Abandoned Camp — Exterior (-7, 2)",
    "original": "SFBGS001LC12Ext02"
  },
  "shatteredspace.esm:04C204": {
    "label": "Irina's Farm — Exterior (-10, 6)",
    "original": "SFBGS001LC13Ext01"
  },
  "shatteredspace.esm:07A1A8": {
    "label": "Irina's Farm — Exterior (-10, 7)",
    "original": "SFBGS001LC13Ext02"
  },
  "shatteredspace.esm:06DCC6": {
    "label": "Abbas Seaweed Farm — Exterior (8, -7)",
    "original": "SFBGS001LC15Ext"
  },
  "shatteredspace.esm:06DCC4": {
    "label": "Abbas Seaweed Farm — Exterior (9, -7)",
    "original": "SFBGS001LC15Ext02"
  },
  "shatteredspace.esm:06DCC5": {
    "label": "Abbas Seaweed Farm — Exterior (9, -8)",
    "original": "SFBGS001LC15Ext03"
  },
  "shatteredspace.esm:06DCC7": {
    "label": "Abbas Seaweed Farm — Exterior (8, -8)",
    "original": "SFBGS001LC15Ext04"
  },
  "shatteredspace.esm:07F200": {
    "label": "Tul'Shahk Monastery — Exterior (8, 9)",
    "original": "SFBGS001LC17Ext"
  },
  "shatteredspace.esm:07F1FD": {
    "label": "Tul'Shahk Monastery — Exterior (9, 9)",
    "original": "SFBGS001LC17Ext02"
  },
  "shatteredspace.esm:07F1FF": {
    "label": "Tul'Shahk Monastery — Exterior (8, 10)",
    "original": "SFBGS001LC17Ext04"
  },
  "shatteredspace.esm:05B194": {
    "label": "Tul'Shahk Monastery — Exterior (9, 10)",
    "original": "SFBGS001LC17Ext05"
  },
  "shatteredspace.esm:076312": {
    "label": "Subterranean Mal'siir Farm — Exterior (4, -6)",
    "original": "SFBGS001LC18Ext"
  },
  "shatteredspace.esm:057484": {
    "label": "Subterranean Mal'siir Farm — Exterior (3, -5)",
    "original": "SFBGS001LC18Ext010"
  },
  "shatteredspace.esm:076313": {
    "label": "Subterranean Mal'siir Farm — Exterior (5, -6)",
    "original": "SFBGS001LC18Ext05"
  },
  "shatteredspace.esm:07807C": {
    "label": "Subterranean Mal'siir Farm — Exterior (4, -7)",
    "original": "SFBGS001LC18Ext07"
  },
  "shatteredspace.esm:07807B": {
    "label": "Subterranean Mal'siir Farm — Exterior (5, -7)",
    "original": "SFBGS001LC18Ext08"
  },
  "shatteredspace.esm:04C1E6": {
    "label": "Sundered Stone Depot — Exterior (6, 8)",
    "original": "SFBGS001LC19Ext"
  },
  "shatteredspace.esm:04C1E4": {
    "label": "Hollow Bluff Depot — Exterior (-11, -1)",
    "original": "SFBGS001LC20Ext"
  },
  "shatteredspace.esm:07E0F4": {
    "label": "Hollow Bluff Depot — Exterior (-11, -2)",
    "original": "SFBGS001LC20Ext01"
  },
  "shatteredspace.esm:07E0F2": {
    "label": "Hollow Bluff Depot — Exterior (-10, -1)",
    "original": "SFBGS001LC20Ext02"
  },
  "shatteredspace.esm:07E0F3": {
    "label": "Hollow Bluff Depot — Exterior (-10, -2)",
    "original": "SFBGS001LC20Ext03"
  },
  "shatteredspace.esm:07E0E7": {
    "label": "Dazra Outskirts — Exterior (-9, -1)",
    "original": "SFBGS001LC20Ext04"
  },
  "shatteredspace.esm:07E0E8": {
    "label": "Dazra Outskirts — Exterior (-9, -2)",
    "original": "SFBGS001LC20Ext05"
  },
  "shatteredspace.esm:04C1E3": {
    "label": "Malik's Groat Farm — Exterior (-7, -2)",
    "original": "SFBGS001LC21Ext"
  },
  "shatteredspace.esm:04873A": {
    "label": "Wayshrine of Redemption — Exterior (1, 2)",
    "original": "SFBGS001LC22Ext"
  },
  "shatteredspace.esm:04C1EE": {
    "label": "Wayshrine of Strength — Exterior (0, -9)",
    "original": "SFBGS001LC23Ext"
  },
  "shatteredspace.esm:075F99": {
    "label": "Wayshrine of Strength — Exterior (-1, -9)",
    "original": "SFBGS001LC23Ext02"
  },
  "shatteredspace.esm:04C1FE": {
    "label": "Wayshrine of Obedience — Exterior (0, 8)",
    "original": "SFBGS001LC24Ext"
  },
  "shatteredspace.esm:0740A1": {
    "label": "Wayshrine of Obedience — Exterior (-1, 8)",
    "original": "SFBGS001LC24Ext02"
  },
  "shatteredspace.esm:0740A0": {
    "label": "Wayshrine of Obedience — Exterior (-1, 9)",
    "original": "SFBGS001LC24Ext03"
  },
  "shatteredspace.esm:04C1FD": {
    "label": "Wayshrine of Obedience — Exterior (0, 9)",
    "original": "SFBGS001LC24Ext04"
  },
  "shatteredspace.esm:04C1F2": {
    "label": "Wayshrine of Devotion — Exterior (8, 3)",
    "original": "SFBGS001LC25Ext"
  },
  "shatteredspace.esm:04C1F9": {
    "label": "Wayshrine of Perseverance — Exterior (-11, 3)",
    "original": "SFBGS001LC26Ext"
  },
  "shatteredspace.esm:074099": {
    "label": "Wayshrine of Perseverance — Exterior (-10, 3)",
    "original": "SFBGS001LC26Ext02"
  },
  "shatteredspace.esm:04C1FA": {
    "label": "Hamadi Station — Exterior (-8, 1)",
    "original": "SFBGS001LC27Ext"
  },
  "shatteredspace.esm:07A0F2": {
    "label": "Hamadi Station — Exterior (-7, 1)",
    "original": "SFBGS001LC27Ext02"
  },
  "shatteredspace.esm:04C1E1": {
    "label": "Chunks — Exterior (-5, -3)",
    "original": "SFBGS001LC28Ext"
  },
  "shatteredspace.esm:04C1ED": {
    "label": "Dazra Groat Farms — Exterior (1, -4)",
    "original": "SFBGS001LC29Ext"
  },
  "shatteredspace.esm:053EF9": {
    "label": "Dazra Outskirts — Exterior (2, -4)",
    "original": "SFBGS001LC29Ext02"
  },
  "shatteredspace.esm:0A8B3E": {
    "label": "Dazra Groat Farms — Exterior (1, -5)",
    "original": "SFBGS001LC29Ext03"
  },
  "shatteredspace.esm:0C6AF0": {
    "label": "Dazra Seaweed Farms — Exterior (-4, 1)",
    "original": "SFBGS001LC32Ext"
  },
  "shatteredspace.esm:0478DA": {
    "label": "Dazra Seaweed Farms — Exterior (-4, 0)",
    "original": "SFBGS001LC32Ext02"
  },
  "shatteredspace.esm:04C1EB": {
    "label": "Listening Post Alpha — Exterior (-9, -11)",
    "original": "SFBGS001LC36Ext"
  },
  "shatteredspace.esm:070E17": {
    "label": "Listening Post Alpha — Exterior (-9, -10)",
    "original": "SFBGS001LC36Ext02"
  },
  "shatteredspace.esm:070E16": {
    "label": "Dazra Outskirts — Exterior (-10, -10)",
    "original": "SFBGS001LC36Ext03"
  },
  "shatteredspace.esm:070E18": {
    "label": "Listening Post Alpha — Exterior (-10, -11)",
    "original": "SFBGS001LC36Ext04"
  },
  "shatteredspace.esm:04C1F1": {
    "label": "Listening Post Beta — Exterior (6, 2)",
    "original": "SFBGS001LC37Ext01"
  },
  "shatteredspace.esm:04C1DE": {
    "label": "Badlands Power Station — Exterior (4, 4)",
    "original": "SFBGS001LC38Ext"
  },
  "shatteredspace.esm:07E12D": {
    "label": "Badlands Power Station — Exterior (4, 5)",
    "original": "SFBGS001LC38Ext02"
  },
  "shatteredspace.esm:047105": {
    "label": "Lakelands Power Station — Exterior (4, -9)",
    "original": "SFBGS001LC39Ext"
  },
  "shatteredspace.esm:04C1E0": {
    "label": "Hillcountry Power Relay — Exterior (-7, -7)",
    "original": "SFBGS001LC40Ext"
  },
  "shatteredspace.esm:04C1FF": {
    "label": "Badlands Power Relay — Exterior (-3, 6)",
    "original": "SFBGS001LC41Ext"
  },
  "shatteredspace.esm:0CDD21": {
    "label": "Badlands Power Relay — Exterior (-4, 6)",
    "original": "SFBGS001LC41Ext02"
  },
  "shatteredspace.esm:04C200": {
    "label": "Spacer Crash Site — Exterior (-6, 7)",
    "original": "SFBGS001LC42Ext"
  },
  "shatteredspace.esm:0ABDE1": {
    "label": "Spacer Crash Site — Exterior (-5, 7)",
    "original": "SFBGS001LC42Ext02"
  },
  "shatteredspace.esm:04C1E2": {
    "label": "Orahim's Shack — Exterior (-5, -5)",
    "original": "SFBGS001LC45Ext"
  },
  "shatteredspace.esm:0C6AF8": {
    "label": "Tomb of the Fang — Exterior (-10, -7)",
    "original": "SFBGS001LC47Ext"
  },
  "shatteredspace.esm:08CC27": {
    "label": "Control Site Kappa — Exterior (-3, -8)",
    "original": "SFBGS001LC48Ext"
  },
  "shatteredspace.esm:08D5F5": {
    "label": "Control Site Kappa — Exterior (-4, -8)",
    "original": "SFBGS001LC48Ext03"
  },
  "shatteredspace.esm:08D5F7": {
    "label": "Control Site Kappa — Exterior (-4, -7)",
    "original": "SFBGS001LC48Ext04"
  },
  "shatteredspace.esm:08D5F3": {
    "label": "Control Site Kappa — Exterior (-5, -9)",
    "original": "SFBGS001LC48Ext05"
  },
  "shatteredspace.esm:04C1DC": {
    "label": "Control Site Kappa — Exterior (-5, -8)",
    "original": "SFBGS001LC48Ext06"
  },
  "shatteredspace.esm:08D5F6": {
    "label": "Control Site Kappa — Exterior (-5, -7)",
    "original": "SFBGS001LC48Ext07"
  },
  "shatteredspace.esm:04C1DD": {
    "label": "Control Site Kappa — Exterior (-5, -10)",
    "original": "SFBGS001LC48Ext08"
  },
  "shatteredspace.esm:08D5F4": {
    "label": "Control Site Kappa — Exterior (-4, -9)",
    "original": "SFBGS001LC48Ext09"
  },
  "shatteredspace.esm:090BC6": {
    "label": "Dazra Outskirts — Exterior (-3, -10)",
    "original": "SFBGS001LC48Ext10"
  },
  "shatteredspace.esm:0B67AD": {
    "label": "Dazra Outskirts — Exterior (-8, 5)",
    "original": "SFBGS001LC49AExt"
  },
  "shatteredspace.esm:06133C": {
    "label": "Dazra Outskirts — Exterior (1, 6)",
    "original": "SFBGS001LC49BExt"
  },
  "shatteredspace.esm:04C1E9": {
    "label": "Dazra Outskirts — Exterior (8, -10)",
    "original": "SFBGS001LC49CExt"
  },
  "shatteredspace.esm:0969CC": {
    "label": "Dazra Outskirts — Exterior (5, -3)",
    "original": "SFBGS001LC49DExt"
  },
  "shatteredspace.esm:050AD0": {
    "label": "Dazra Outskirts — Exterior (-6, -10)",
    "original": "SFBGS001LC49EExt"
  },
  "shatteredspace.esm:04C1DF": {
    "label": "Vaifala Crash Site — Exterior (2, -11)",
    "original": "SFBGS001LC50Ext"
  },
  "shatteredspace.esm:04C271": {
    "label": "Hermit Groat Farm — Exterior (-1, -3)",
    "original": "SFBGS001LC53Ext"
  },
  "shatteredspace.esm:11A138": {
    "label": "Hermit Groat Farm — Exterior (-2, -3)",
    "original": "SFBGS001LC53Ext02"
  },
  "shatteredspace.esm:04C24C": {
    "label": "Hermit Groat Farm — Exterior (-1, -4)",
    "original": "SFBGS001LC53Ext03"
  },
  "shatteredspace.esm:04C276": {
    "label": "Orm Filtration Facility — Exterior (-2, -1)",
    "original": "SFBGS001LC54Ext"
  },
  "shatteredspace.esm:04C279": {
    "label": "Orm Filtration Facility — Exterior (-1, -1)",
    "original": "SFBGS001LC54Ext02"
  },
  "shatteredspace.esm:04C27A": {
    "label": "Orm Filtration Facility — Exterior (-1, 0)",
    "original": "SFBGS001LC54Ext03"
  },
  "shatteredspace.esm:052B30": {
    "label": "Lake Watchtower — Exterior (-4, -1)",
    "original": "SFBGS001LC55Ext01"
  },
  "shatteredspace.esm:0AAB07": {
    "label": "Oasis Watch Tower — Exterior (1, 0)",
    "original": "SFBGS001LC57Ext01"
  },
  "shatteredspace.esm:04100A": {
    "label": "Overlook Watchtower — Exterior (0, -3)",
    "original": "SFBGS001LC58Ext"
  },
  "shatteredspace.esm:046D0E": {
    "label": "Overlook Watchtower — Exterior (-1, -3)",
    "original": "SFBGS001LC58Ext03"
  },
  "shatteredspace.esm:046D0D": {
    "label": "Overlook Watchtower — Exterior (-1, -2)",
    "original": "SFBGS001LC58Ext04"
  },
  "shatteredspace.esm:072BA2": {
    "label": "Ridgeline Watchtower — Exterior (0, 0)",
    "original": "SFBGS001LC59Ext01"
  },
  "shatteredspace.esm:072BA4": {
    "label": "Ridgeline Watchtower — Exterior (1, 0)",
    "original": "SFBGS001LC59Ext02"
  },
  "shatteredspace.esm:072BA5": {
    "label": "Ridgeline Watchtower — Exterior (1, 1)",
    "original": "SFBGS001LC59Ext03"
  },
  "shatteredspace.esm:072BA1": {
    "label": "Ridgeline Watchtower — Exterior (0, 1)",
    "original": "SFBGS001LC59Ext04"
  },
  "shatteredspace.esm:10E348": {
    "label": "Anomalous Cave — Interior",
    "original": "SFBGS001LC60Int"
  },
  "shatteredspace.esm:04C278": {
    "label": "Orm Filtration Facility — Exterior (-2, 0)",
    "original": "SFBGS001LD54Ext04"
  },
  "shatteredspace.esm:04C272": {
    "label": "Orm Filtration Facility — Exterior (0, 0)",
    "original": "SFBGS001LD54Ext06"
  },
  "shatteredspace.esm:0F0128": {
    "label": "Hoodoo Rock Camp — Exterior (-1, 0)",
    "original": "SFBGS001OE07"
  },
  "shatteredspace.esm:0F0121": {
    "label": "Va'ruun Camp — Exterior (-1, 0)",
    "original": "SFBGS001OE12Ext01"
  },
  "shatteredspace.esm:0F6F76": {
    "label": "Gas Extraction Site — Exterior (-1, -1)",
    "original": "SFBGS001OE15Ext01"
  },
  "shatteredspace.esm:0F6F74": {
    "label": "Gas Extraction Site — Exterior (-1, 0)",
    "original": "SFBGS001OE15Ext02"
  },
  "shatteredspace.esm:0F6F75": {
    "label": "Crashed Ship — Exterior (-1, -1)",
    "original": "SFBGS001OE19Ext01"
  },
  "shatteredspace.esm:0F6F72": {
    "label": "Crashed Ship — Exterior (0, -1)",
    "original": "SFBGS001OE19Ext02"
  },
  "shatteredspace.esm:0F6F6F": {
    "label": "Crashed Ship — Exterior (-1, 0)",
    "original": "SFBGS001OE19Ext03"
  },
  "shatteredspace.esm:078F1A": {
    "label": "Sniper Nest — Exterior (4, -1)",
    "original": "SFBGS001POI01Ext"
  },
  "shatteredspace.esm:078F18": {
    "label": "Sniper Nest — Exterior (4, 0)",
    "original": "SFBGS001POI01Ext02"
  },
  "shatteredspace.esm:078F1B": {
    "label": "Target Range — Exterior (4, -2)",
    "original": "SFBGS001POI02Ext"
  },
  "shatteredspace.esm:15568E": {
    "label": "Courier Center — Exterior (-5, -1)",
    "original": "SFBGS001POI03Ext"
  },
  "shatteredspace.esm:057487": {
    "label": "Lakeside Dock — Exterior (-4, 3)",
    "original": "SFBGS001POI04Ext"
  },
  "shatteredspace.esm:052B66": {
    "label": "Lakeside Dock — Exterior (-3, 3)",
    "original": "SFBGS001POI04Ext02"
  },
  "shatteredspace.esm:05BE8F": {
    "label": "Improvised Shelter — Exterior (3, 3)",
    "original": "SFBGS001POI05Ext"
  },
  "shatteredspace.esm:0485D0": {
    "label": "Dazra Outskirts — Exterior (5, 1)",
    "original": "SFBGS001POIRuins02"
  },
  "shatteredspace.esm:084C25": {
    "label": "Dazra Outskirts — Exterior (3, -3)",
    "original": "SFBGS001POIRuins03"
  },
  "shatteredspace.esm:0485D8": {
    "label": "Dazra Outskirts — Exterior (3, 2)",
    "original": "SFBGS001POIRuins04"
  },
  "shatteredspace.esm:0485DE": {
    "label": "Dazra Outskirts — Exterior (1, 0)",
    "original": "SFBGS001POIRuins05"
  },
  "shatteredspace.esm:0485D7": {
    "label": "Dazra Orphanage — Exterior (4, -2)",
    "original": "SFBGS001POIRuins06"
  },
  "shatteredspace.esm:0969CD": {
    "label": "Dazra Outskirts — Exterior (4, -3)",
    "original": "SFBGS001POIRuins07"
  },
  "shatteredspace.esm:084C26": {
    "label": "Dazra Outskirts — Exterior (2, -3)",
    "original": "SFBGS001POIRuins08"
  },
  "shatteredspace.esm:08E4F0": {
    "label": "Dazra Outskirts — Exterior (2, -2)",
    "original": "SFBGS001POIRuins09"
  },
  "shatteredspace.esm:0901AA": {
    "label": "Dazra Outskirts — Exterior (2, 4)",
    "original": "SFBGS001WNPCSpawn01Ext"
  },
  "shatteredspace.esm:05F6F9": {
    "label": "Dazra Outskirts — Exterior (-2, 4)",
    "original": "SFBGS001WNPCSpawn02Ext"
  },
  "shatteredspace.esm:0CB024": {
    "label": "Dazra Outskirts — Exterior (-6, 4)",
    "original": "SFBGS001WNPCSpawn03Ext"
  },
  "shatteredspace.esm:05A5C0": {
    "label": "Dazra Outskirts — Exterior (-7, -3)",
    "original": "SFBGS001WNPCSpawn04Ext"
  },
  "shatteredspace.esm:089A57": {
    "label": "Dazra Outskirts — Exterior (-5, -6)",
    "original": "SFBGS001WNPCSpawn05Ext"
  },
  "shatteredspace.esm:09F625": {
    "label": "Dazra Outskirts — Exterior (-3, -7)",
    "original": "SFBGS001WNPCSpawn06Ext"
  },
  "shatteredspace.esm:05ACB2": {
    "label": "Dazra Outskirts — Exterior (8, -4)",
    "original": "SFBGS001WNPCSpawn07Ext"
  },
  "shatteredspace.esm:0884EA": {
    "label": "Dazra Outskirts — Exterior (7, 1)",
    "original": "SFBGS001WNPCSpawn08Ext"
  },
  "sfbgs00d.esm:00243D": {
    "label": "Autonomous Waste Processing Plant — Exterior (0, -1)",
    "original": "SFBGS00DDR001Ext"
  },
  "sfbgs00d.esm:00243E": {
    "label": "Autonomous Waste Processing Plant — Exterior (0, 0)",
    "original": "SFBGS00DDR001Ext01"
  },
  "sfbgs00d.esm:002442": {
    "label": "Autonomous Waste Processing Plant — Exterior (-1, 0)",
    "original": "SFBGS00DDR001Ext02"
  },
  "sfbgs00d.esm:00243F": {
    "label": "Autonomous Waste Processing Plant — Exterior (-1, -1)",
    "original": "SFBGS00DDR001Ext03"
  },
  "sfbgs00d.esm:004C38": {
    "label": "Ship Stop — Exterior (0, 0)",
    "original": "SFBGS00DDR002Ext01"
  },
  "sfbgs00d.esm:004C3B": {
    "label": "Ship Stop — Exterior (-1, -1)",
    "original": "SFBGS00DDR002Ext02"
  },
  "sfbgs00d.esm:004C3D": {
    "label": "Ship Stop — Exterior (0, -1)",
    "original": "SFBGS00DDR002Ext03"
  },
  "sfbgs00d.esm:004C3C": {
    "label": "Ship Stop — Exterior (-1, 0)",
    "original": "SFBGS00DDR002Ext04"
  },
  "sfbgs00d.esm:007298": {
    "label": "Pillaged Colony Outpost — Exterior (0, 0)",
    "original": "SFBGS00DDR004Ext"
  },
  "sfbgs00d.esm:006F69": {
    "label": "Ambush Outpost — Exterior (0, 0)",
    "original": "SFBGS00DDR007Ext"
  },
  "sfbgs00d.esm:00EF40": {
    "label": "Lost Research Facility — Exterior (0, 0)",
    "original": "SFBGS00DDR008Ext"
  },
  "sfbgs00d.esm:0076E4": {
    "label": "Galx-E Trailer Communes — Exterior (0, 0)",
    "original": "SFBGS00DDR009Ext01"
  },
  "sfbgs00d.esm:00A677": {
    "label": "Big Iron CQB Training Center — Exterior (0, 0)",
    "original": "SFBGS00DDR010Ext01"
  },
  "sfbgs00d.esm:0079E6": {
    "label": "Wildlife Viewing Station — Exterior (0, 0)",
    "original": "SFBGS00DDR011Ext"
  },
  "sfbgs00d.esm:00873F": {
    "label": "Defunct Broadcasting Station — Exterior (0, 0)",
    "original": "SFBGS00DDR013Ext"
  },
  "sfbgs00d.esm:00E077": {
    "label": "Defunct Shipping Facility — Exterior (0, 0)",
    "original": "SFBGS00DDR014Ext"
  },
  "sfbgs00d.esm:00E076": {
    "label": "Defunct Shipping Facility — Exterior (0, -1)",
    "original": "SFBGS00DDR014Ext02"
  },
  "sfbgs00d.esm:00E074": {
    "label": "Defunct Shipping Facility — Exterior (-1, -1)",
    "original": "SFBGS00DDR014Ext03"
  },
  "sfbgs00d.esm:00E075": {
    "label": "Defunct Shipping Facility — Exterior (-1, 0)",
    "original": "SFBGS00DDR014Ext04"
  },
  "sfbgs00d.esm:008754": {
    "label": "Antiquated Radio Observatory — Exterior (0, 0)",
    "original": "SFBGS00DDR015World Ext"
  },
  "sfbgs00d.esm:0094D0": {
    "label": "Isolated Maintenance Hangar — Exterior (0, -1)",
    "original": "SFBGS00DDR016Ext"
  },
  "sfbgs00d.esm:0094CE": {
    "label": "Isolated Maintenance Hangar — Exterior (0, 0)",
    "original": "SFBGS00DDR016Ext01"
  },
  "sfbgs00d.esm:0094CF": {
    "label": "Isolated Maintenance Hangar — Exterior (-1, -1)",
    "original": "SFBGS00DDR016Ext02"
  },
  "sfbgs00d.esm:0094DC": {
    "label": "Isolated Maintenance Hangar — Exterior (-1, 0)",
    "original": "SFBGS00DDR016Ext03"
  },
  "sfbgs00d.esm:007B6A": {
    "label": "Greenhouse Farm — Exterior (0, 0)",
    "original": "SFBGS00DDR017Ext"
  },
  "sfbgs00d.esm:008DD3": {
    "label": "Abandoned Tower — Exterior (0, 0)",
    "original": "SFBGS00DDR018Ext"
  },
  "sfbgs00d.esm:011373": {
    "label": "Crashed Food Truck — Exterior (0, 0)",
    "original": "SFBGS00DPOICL01Ext"
  },
  "sfbgs00d.esm:00BF3A": {
    "label": "Scattered Shipwreck — Exterior (-1, -1)",
    "original": "SFBGS00DPOIGN02Ext"
  },
  "sfbgs00d.esm:00BF39": {
    "label": "Scattered Shipwreck — Exterior (-1, 0)",
    "original": "SFBGS00DPOIGN02Ext02"
  },
  "sfbgs00d.esm:00CBDB": {
    "label": "Scattered Shipwreck — Exterior (0, 0)",
    "original": "SFBGS00DPOIGN02Ext03"
  },
  "sfbgs00d.esm:00CBD5": {
    "label": "Scattered Shipwreck — Exterior (0, -1)",
    "original": "SFBGS00DPOIGN02Ext04"
  },
  "sfbgs00d.esm:00AA25": {
    "label": "Crashed Ship — Exterior (0, 0)",
    "original": "SFBGS00DPOIGN04Ext"
  },
  "sfbgs00d.esm:011662": {
    "label": "Explorer's Refuge — Exterior (0, 0)",
    "original": "SFBGS00DPOIYG01Ext"
  },
  "sfbgs00d.esm:023B66": {
    "label": "Decommisionned Missile Silo — Exterior (0, 0)",
    "original": "SFFLDR021x Ext01"
  },
  "sfbgs00d.esm:020482": {
    "label": "Mineral Farm — Exterior (0, 0)",
    "original": "SFFLDR022Ext01"
  },
  "sfbgs00d.esm:025687": {
    "label": "Meteorite Mine — Exterior (0, -1)",
    "original": "SFFLDR023Ext01"
  },
  "sfbgs00d.esm:025686": {
    "label": "Meteorite Mine — Exterior (0, 0)",
    "original": "SFFLDR023Ext02"
  },
  "sfbgs00d.esm:03077C": {
    "label": "Concrete Plant — Exterior (1, -1)",
    "original": "SFFLDR025Ext01"
  },
  "sfbgs00d.esm:03077A": {
    "label": "Concrete Plant — Exterior (0, -1)",
    "original": "SFFLDR025Ext02"
  },
  "sfbgs00d.esm:030776": {
    "label": "Concrete Plant — Exterior (-1, -1)",
    "original": "SFFLDR025Ext03"
  },
  "sfbgs00d.esm:03077D": {
    "label": "Concrete Plant — Exterior (1, 0)",
    "original": "SFFLDR025Ext04"
  },
  "sfbgs00d.esm:030774": {
    "label": "Concrete Plant — Exterior (0, 0)",
    "original": "SFFLDR025Ext05"
  },
  "sfbgs00d.esm:030778": {
    "label": "Concrete Plant — Exterior (-1, 1)",
    "original": "SFFLDR025Ext06"
  },
  "sfbgs00d.esm:030777": {
    "label": "Concrete Plant — Exterior (-1, 0)",
    "original": "SFFLDR025Ext07"
  },
  "sfbgs00d.esm:03077B": {
    "label": "Concrete Plant — Exterior (0, 1)",
    "original": "SFFLDR025Ext08"
  },
  "sfbgs00d.esm:03077E": {
    "label": "Concrete Plant — Exterior (1, 1)",
    "original": "SFFLDR025Ext09"
  },
  "sfbgs00d.esm:05DC00": {
    "label": "Illicit Surgery Center — Exterior (0, 0)",
    "original": "SFFLDR026Ext01"
  },
  "sfbgs00d.esm:04B50D": {
    "label": "Asteroid Prison Mine — Exterior",
    "original": "SFFLDR027Ship Exterior"
  },
  "sfbgs00d.esm:04B50B": {
    "label": "Asteroid Prison Mine — Interior",
    "original": "SFFLDR027Ship Interior"
  },
  "sfbgs00d.esm:044B2E": {
    "label": "RedCap Asteroid Mine — Exterior",
    "original": "SFFLDR028Ship Exterior"
  },
  "sfbgs00d.esm:044B2D": {
    "label": "RedCap Asteroid Mine — Interior",
    "original": "SFFLDR028Ship Interior"
  },
  "sfbgs00d.esm:049D90": {
    "label": "Bodach Asteroid Mine Cavern — Interior",
    "original": "SFFLDR029Interior"
  },
  "sfbgs00d.esm:04A289": {
    "label": "Bodach Asteroid Mine — Exterior",
    "original": "SFFLDR029Ship Exterior"
  },
  "sfbgs00d.esm:04A287": {
    "label": "Bodach Asteroid Mine — Interior",
    "original": "SFFLDR029Ship Interior"
  },
  "sfbgs00d.esm:0525DA": {
    "label": "Atka's House — Exterior (0, 0)",
    "original": "SFFLM03Home Ext01"
  },
  "sfbgs00d.esm:0525DD": {
    "label": "Atka's House — Exterior (-1, 0)",
    "original": "SFFLM03Home Ext02"
  },
  "sfbgs00d.esm:0525DE": {
    "label": "Atka's House — Exterior (-1, -1)",
    "original": "SFFLM03Home Ext03"
  },
  "sfbgs00d.esm:0525DB": {
    "label": "Atka's House — Exterior (0, -1)",
    "original": "SFFLM03Home Ext04"
  },
  "sfbgs00d.esm:021248": {
    "label": "Test Cell — Storage Cell",
    "original": "SFFL_MS01 Non-Instanced Refs"
  },
  "sfbgs00d.esm:0525DF": {
    "label": "Old Maintenance Garage — Exterior (0, 0)",
    "original": "SFFLOEAF09Ext"
  },
  "sfbgs00d.esm:044616": {
    "label": "Industrialized Farm — Exterior (0, 0)",
    "original": "SFFLOESM03Ext01"
  },
  "sfbgs00d.esm:036F6E": {
    "label": "Scrap Metal Foundry — Exterior (0, -1)",
    "original": "SFFLOESM04Ext01"
  },
  "sfbgs00d.esm:036F6B": {
    "label": "Scrap Metal Foundry — Exterior (-1, 0)",
    "original": "SFFLOESM04Ext02"
  },
  "sfbgs00d.esm:036F66": {
    "label": "Scrap Metal Foundry — Exterior (0, 0)",
    "original": "SFFLOESM04Ext03"
  },
  "sfbgs00d.esm:036F6A": {
    "label": "Scrap Metal Foundry — Exterior (-1, -1)",
    "original": "SFFLOESM04Ext04"
  },
  "sfbgs050.esm:01931B": {
    "label": "Terran Reclaimer — Exterior (-1, -1)",
    "original": "SFTERAssault Platform Ext01"
  },
  "sfbgs050.esm:038811": {
    "label": "Santos Homestead — Exterior (0, 0)",
    "original": "SFTERDR001Ext01"
  },
  "sfbgs050.esm:02BA0A": {
    "label": "Drop Pod Landing Site — Exterior (0, 0)",
    "original": "SFTERDrop Pod001Ext"
  },
  "sfbgs050.esm:02BA0C": {
    "label": "Drop Pod Landing Site — Exterior (-1, 0)",
    "original": "SFTERDrop Pod001Ext01"
  },
  "sfbgs050.esm:02BA0D": {
    "label": "Drop Pod Landing Site — Exterior (0, -1)",
    "original": "SFTERDrop Pod001Ext02"
  },
  "sfbgs050.esm:02BA0B": {
    "label": "Drop Pod Landing Site — Exterior (-1, -1)",
    "original": "SFTERDrop Pod001Ext03"
  },
  "sfbgs050.esm:034636": {
    "label": "Drop Pod Landing Site — Exterior (0, 0)",
    "original": "SFTERDrop Pod002Ext"
  },
  "sfbgs050.esm:034634": {
    "label": "Drop Pod Landing Site — Exterior (-1, 0)",
    "original": "SFTERDrop Pod002Ext01"
  },
  "sfbgs050.esm:034635": {
    "label": "Drop Pod Landing Site — Exterior (-1, -1)",
    "original": "SFTERDrop Pod002Ext02"
  },
  "sfbgs050.esm:034633": {
    "label": "Drop Pod Landing Site — Exterior (0, -1)",
    "original": "SFTERDrop Pod002Ext03"
  },
  "sfbgs050.esm:03462E": {
    "label": "Drop Pod Landing Site — Exterior (0, 0)",
    "original": "SFTERDrop Pod003Ext"
  },
  "sfbgs050.esm:034630": {
    "label": "Drop Pod Landing Site — Exterior (0, -1)",
    "original": "SFTERDrop Pod003Ext01"
  },
  "sfbgs050.esm:034632": {
    "label": "Drop Pod Landing Site — Exterior (-1, -1)",
    "original": "SFTERDrop Pod003Ext02"
  },
  "sfbgs050.esm:034631": {
    "label": "Drop Pod Landing Site — Exterior (-1, 0)",
    "original": "SFTERDrop Pod003Ext03"
  },
  "sfbgs050.esm:03462A": {
    "label": "Drop Pod Landing Site — Exterior (0, 0)",
    "original": "SFTERDrop Pod004Ext"
  },
  "sfbgs050.esm:03462C": {
    "label": "Drop Pod Landing Site — Exterior (0, -1)",
    "original": "SFTERDrop Pod004Ext01"
  },
  "sfbgs050.esm:03462F": {
    "label": "Drop Pod Landing Site — Exterior (-1, -1)",
    "original": "SFTERDrop Pod004Ext02"
  },
  "sfbgs050.esm:03462D": {
    "label": "Drop Pod Landing Site — Exterior (-1, 0)",
    "original": "SFTERDrop Pod004Ext03"
  },
  "sfbgs050.esm:034626": {
    "label": "Drop Pod Landing Site — Exterior (0, 0)",
    "original": "SFTERDrop Pod005Ext"
  },
  "sfbgs050.esm:034629": {
    "label": "Drop Pod Landing Site — Exterior (-1, 0)",
    "original": "SFTERDrop Pod005Ext01"
  },
  "sfbgs050.esm:03462B": {
    "label": "Drop Pod Landing Site — Exterior (-1, -1)",
    "original": "SFTERDrop Pod005Ext02"
  },
  "sfbgs050.esm:034628": {
    "label": "Drop Pod Landing Site — Exterior (0, -1)",
    "original": "SFTERDrop Pod005Ext03"
  },
  "sfbgs050.esm:034622": {
    "label": "Drop Pod Landing Site — Exterior (0, 0)",
    "original": "SFTERDrop Pod006Ext"
  },
  "sfbgs050.esm:034625": {
    "label": "Drop Pod Landing Site — Exterior (-1, 0)",
    "original": "SFTERDrop Pod006Ext01"
  },
  "sfbgs050.esm:034627": {
    "label": "Drop Pod Landing Site — Exterior (-1, -1)",
    "original": "SFTERDrop Pod006Ext02"
  },
  "sfbgs050.esm:034624": {
    "label": "Drop Pod Landing Site — Exterior (0, -1)",
    "original": "SFTERDrop Pod006Ext03"
  },
  "sfbgs050.esm:03461E": {
    "label": "Drop Pod Landing Site — Exterior (0, 0)",
    "original": "SFTERDrop Pod007Ext"
  },
  "sfbgs050.esm:034620": {
    "label": "Drop Pod Landing Site — Exterior (0, -1)",
    "original": "SFTERDrop Pod007Ext01"
  },
  "sfbgs050.esm:034623": {
    "label": "Drop Pod Landing Site — Exterior (-1, -1)",
    "original": "SFTERDrop Pod007Ext02"
  },
  "sfbgs050.esm:034621": {
    "label": "Drop Pod Landing Site — Exterior (-1, 0)",
    "original": "SFTERDrop Pod007Ext03"
  },
  "sfbgs050.esm:03461A": {
    "label": "Drop Pod Landing Site — Exterior (0, 0)",
    "original": "SFTERDrop Pod008Ext"
  },
  "sfbgs050.esm:03461C": {
    "label": "Drop Pod Landing Site — Exterior (0, -1)",
    "original": "SFTERDrop Pod008Ext01"
  },
  "sfbgs050.esm:03461F": {
    "label": "Drop Pod Landing Site — Exterior (-1, -1)",
    "original": "SFTERDrop Pod008Ext02"
  },
  "sfbgs050.esm:03461D": {
    "label": "Drop Pod Landing Site — Exterior (-1, 0)",
    "original": "SFTERDrop Pod008Ext03"
  },
  "sfbgs050.esm:034616": {
    "label": "Drop Pod Landing Site — Exterior (0, 0)",
    "original": "SFTERDrop Pod009Ext"
  },
  "sfbgs050.esm:034618": {
    "label": "Drop Pod Landing Site — Exterior (0, -1)",
    "original": "SFTERDrop Pod009Ext01"
  },
  "sfbgs050.esm:03461B": {
    "label": "Drop Pod Landing Site — Exterior (-1, -1)",
    "original": "SFTERDrop Pod009Ext02"
  },
  "sfbgs050.esm:034619": {
    "label": "Drop Pod Landing Site — Exterior (-1, 0)",
    "original": "SFTERDrop Pod009Ext03"
  },
  "sfbgs050.esm:034613": {
    "label": "Drop Pod Landing Site — Exterior (0, 0)",
    "original": "SFTERDrop Pod010Ext"
  },
  "sfbgs050.esm:034614": {
    "label": "Drop Pod Landing Site — Exterior (0, -1)",
    "original": "SFTERDrop Pod010Ext01"
  },
  "sfbgs050.esm:034617": {
    "label": "Drop Pod Landing Site — Exterior (-1, -1)",
    "original": "SFTERDrop Pod010Ext02"
  },
  "sfbgs050.esm:034615": {
    "label": "Drop Pod Landing Site — Exterior (-1, 0)",
    "original": "SFTERDrop Pod010Ext03"
  },
  "sfbgs050.esm:03552D": {
    "label": "Overrun Colony Outpost — Exterior (0, 0)",
    "original": "SFTERDrop Pod011Ext"
  },
  "sfbgs050.esm:0743FA": {
    "label": "Ransacked Mining Outpost — Exterior (0, 0)",
    "original": "SFTERDrop Pod012Ext"
  },
  "sfbgs050.esm:074DB0": {
    "label": "Captured Biochemical Silo — Exterior (0, 0)",
    "original": "SFTERDrop Pod013Ext"
  },
  "sfbgs050.esm:075124": {
    "label": "Overtaken Military Encampment — Exterior (0, 0)",
    "original": "SFTERDrop Pod014Ext"
  },
  "sfbgs050.esm:00F9F6": {
    "label": "EC Robot Alias Cell — Alias Cell",
    "original": "SFTER Robot Alias Cell"
  },
  "sfbgs050.esm:01B11B": {
    "label": "Opulence of the Stars — Exterior",
    "original": "SFTERLC001Ship Created Exterior"
  },
  "sfbgs050.esm:014BB4": {
    "label": "Machina Forge Prime Cavern — Interior",
    "original": "SFTERLC002Asteroid Mine Interior"
  },
  "sfbgs050.esm:014BB2": {
    "label": "Machina Forge Prime — Exterior",
    "original": "SFTERLC002Asteroid Mine Ship Exterior"
  },
  "sfbgs050.esm:014BB3": {
    "label": "Machina Forge Prime — Interior",
    "original": "SFTERLC002Asteroid Mine Ship Interior"
  },
  "sfbgs050.esm:005B51": {
    "label": "Unifier — Interior",
    "original": "SFTERLC03Unifier Ship Interior"
  },
  "sfbgs050.esm:0AD144": {
    "label": "Terran Relay Station — Exterior",
    "original": "SFTERMS02Relay Node Ship Exterior"
  },
  "sfbgs050.esm:0AD143": {
    "label": "Terran Relay Station — Interior",
    "original": "SFTERMS02Relay Node Ship Interior"
  },
  "sfbgs050.esm:02BBA9": {
    "label": "Scrapyard — Exterior (1, -1)",
    "original": "SFTEROESD05ext01"
  },
  "sfbgs050.esm:02BBAC": {
    "label": "Scrapyard — Exterior (0, -1)",
    "original": "SFTEROESD05ext02"
  },
  "sfbgs050.esm:02BBB0": {
    "label": "Scrapyard — Exterior (-1, -1)",
    "original": "SFTEROESD05ext03"
  },
  "sfbgs050.esm:02BBAF": {
    "label": "Scrapyard — Exterior (-1, 0)",
    "original": "SFTEROESD05ext04"
  },
  "sfbgs050.esm:02BBB1": {
    "label": "Scrapyard — Exterior (0, 0)",
    "original": "SFTEROESD05ext05"
  },
  "sfbgs050.esm:02BBA8": {
    "label": "Scrapyard — Exterior (1, 0)",
    "original": "SFTEROESD05ext06"
  },
  "sfbgs050.esm:02BBA7": {
    "label": "Scrapyard — Exterior (1, 1)",
    "original": "SFTEROESD05ext07"
  },
  "sfbgs050.esm:02BBAB": {
    "label": "Scrapyard — Exterior (0, 1)",
    "original": "SFTEROESD05ext08"
  },
  "sfbgs050.esm:02BBAE": {
    "label": "Scrapyard — Exterior (-1, 1)",
    "original": "SFTEROESD05ext09"
  },
  "sfbgs050.esm:02B00E": {
    "label": "Freestar Collective Outpost — Exterior (-1, 0)",
    "original": "SFTEROutpost FCExt01"
  },
  "sfbgs050.esm:02B00B": {
    "label": "Freestar Collective Outpost — Exterior (-1, -1)",
    "original": "SFTEROutpost FCExt02"
  },
  "sfbgs050.esm:02B010": {
    "label": "Freestar Collective Outpost — Exterior (0, -1)",
    "original": "SFTEROutpost FCExt03"
  },
  "sfbgs050.esm:02B00A": {
    "label": "Freestar Collective Outpost — Exterior (0, 0)",
    "original": "SFTEROutpost FCExt04"
  },
  "sfbgs050.esm:02B03E": {
    "label": "Ryujin Industries Outpost — Exterior (-1, -1)",
    "original": "SFTEROutpost R1Ext01"
  },
  "sfbgs050.esm:02B03F": {
    "label": "Ryujin Industries Outpost — Exterior (-1, 0)",
    "original": "SFTEROutpost RIExt02"
  },
  "sfbgs050.esm:02B036": {
    "label": "Ryujin Industries Outpost — Exterior (0, 0)",
    "original": "SFTEROutpost RIExt03"
  },
  "sfbgs050.esm:02B037": {
    "label": "Ryujin Industries Outpost — Exterior (0, -1)",
    "original": "SFTEROutpost RIExt04"
  },
  "sfbgs050.esm:02B079": {
    "label": "United Colonies Outpost — Exterior (-1, -1)",
    "original": "SFTEROutpost UCExt01"
  },
  "sfbgs050.esm:02B078": {
    "label": "United Colonies Outpost — Exterior (-1, 0)",
    "original": "SFTEROutpost UCExt02"
  },
  "sfbgs050.esm:02B07B": {
    "label": "United Colonies Outpost — Exterior (0, 0)",
    "original": "SFTEROutpost UCExt03"
  },
  "sfbgs050.esm:02B074": {
    "label": "United Colonies Outpost — Exterior (0, -1)",
    "original": "SFTEROutpost UCExt04"
  },
  "sfbgs050.esm:02B45C": {
    "label": "Terran Repeater — Exterior",
    "original": "SFTERRelay Node Ship Exterior"
  },
  "sfbgs050.esm:02B45B": {
    "label": "Terran Repeater — Interior",
    "original": "SFTERRelay Node Ship Interior"
  }
};
export function applyReviewedCellName<T extends {type?:string;value:string;plugin?:string;localFormId?:string;label:string;originalName?:string;keywords?:string[]}>(record:T):T {
 if(record.type!=='CELL')return record;
 const key=(record.plugin??'Starfield.esm').toLowerCase()+':'+(record.localFormId??record.value).toUpperCase().slice(-6).padStart(6,'0');
 const name=NAMES[key];
 return applyReportedCellName(name?{...record,label:name.label,originalName:name.original,keywords:[...new Set([...(record.keywords??[]),name.original])]}:record);
}
