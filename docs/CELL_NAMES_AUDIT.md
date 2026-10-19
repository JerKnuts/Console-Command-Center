# Official CELL naming audit — 1.3.14

Audited the 410 packaged CELL records from SFBGS001 Alias Cell through SFTERRelay Node Ship Interior against the installed Starfield, Shattered Space, Free Lanes and Terran Armada masters and their English STRINGS tables. Names are resolved through each cell's XLCN location, its PNAM location parents, or its containing WRLD group. Reference Form IDs are resolved through the owning file's master list, not assumed runtime load-order indexes.

310 cells have usable authored location/worldspace names. Labels preserve scope: exterior tiles carry their XCLC grid coordinates; ship interiors/exteriors and alias/storage cells are distinguished. A worldspace-derived name identifies the broader worldspace, not a newly asserted point of interest. The 100 entries below lack usable names along these paths and retain their identifiers. No speculative landmark names were added. Existing accepted user aliases still take precedence. Original labels and Editor IDs remain searchable, and teleport commands continue to use the original Editor ID.

This audit identifies records, not teleport safety. Classification and exploration permissions are unchanged except for exact user-reported Reference Only findings.

## Names recovered

| Record | Previous label | New label | Evidence |
|---|---|---|---|
| shatteredspace.esm:0C6406 | SFBGS001 Alias Cell | Test Interior Location — Alias Cell | Linked location: SFBGS001AliasLocation (shatteredspace.esm:0C6412) |
| shatteredspace.esm:0485DB | SFBGS001Crater01 | Dazra Outskirts — Exterior (2, 2) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:0CBA41 | SFBGS001Dazra OE01 | Dazra Outskirts — Exterior (3, 6) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:04C1EC | SFBGS001Dazra OE02 | Cave — Exterior (-10, -9) | Linked location: SFBGS001DazraOE02Location (shatteredspace.esm:0DF276) |
| shatteredspace.esm:06DCC8 | SFBGS001Dazra OE03 | Dazra Outskirts — Exterior (7, -6) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:0717E4 | SFBGS001Dazra OE04 | Dazra Outskirts — Exterior (8, 2) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:0BD506 | SFBGS001Dazra OE05 | Dazra Outskirts — Exterior (6, 4) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:05F6F0 | SFBGS001Dazra OE06 | Dazra Outskirts — Exterior (-1, 6) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:05ACB1 | SFBGS001Dazra OE07 | Dazra Outskirts — Exterior (8, -3) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:0475F1 | SFBGS001Dazra OE08 | Dazra Outskirts — Exterior (8, -9) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:0BEDD3 | SFBGS001Dazra OE09 | Dazra Outskirts — Exterior (-3, -6) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:07DBEC | SFBGS001Dazra OE10 | Dazra Outskirts — Exterior (-7, -4) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:07E0F5 | SFBGS001Dazra OE11 | Dazra Outskirts — Exterior (-9, -4) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:0478D6 | SFBGS001Dazra OE12 | Dazra Outskirts — Exterior (-7, -9) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:047107 | SFBGS001Dazra OE13 | Dazra Outskirts — Exterior (6, -8) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:06871F | SFBGS001Dazra OE14 | Dazra Outskirts — Exterior (2, -9) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:076411 | SFBGS001Dazra OE15Ext | Dazra Outskirts — Exterior (-2, -3) | Parent location: SFBGS001LandscapePOIDunes01Location (shatteredspace.esm:155693) |
| shatteredspace.esm:07E4D2 | SFBGS001Dazra OE16Ext | Dazra Outskirts — Exterior (1, 1) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:034E03 | SFBGS001Dazra OE17Ext | Dazra Outskirts — Exterior (-3, 3) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:0A5047 | SFBGS001Dazra OE18Ext | Dazra Outskirts — Exterior (-3, -5) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:0A3BC3 | SFBGS001Dazra OE19Ext | Dazra Outskirts — Exterior (2, -5) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:036B44 | SFBGS001Dazra OE20Ext | Dazra Outskirts — Exterior (1, 3) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:080404 | SFBGS001LC03Ext | Shadow Station Epsilon — Exterior (3, 10) | Linked location: SFBGS001LC03ExteriorLocation (shatteredspace.esm:004517) |
| shatteredspace.esm:04C1DB | SFBGS001LC03Ext02 | Shadow Station Epsilon — Exterior (3, 9) | Linked location: SFBGS001LC03ExteriorLocation (shatteredspace.esm:004517) |
| shatteredspace.esm:0870FD | SFBGS001LC03Ext03 | Shadow Station Epsilon — Exterior (2, 10) | Linked location: SFBGS001LC03ExteriorLocation (shatteredspace.esm:004517) |
| shatteredspace.esm:04C1F4 | SFBGS001LC04Ext | Apostate's Refuge — Exterior (-10, 9) | Linked location: SFBGS001LC04Location (shatteredspace.esm:03788C) |
| shatteredspace.esm:076302 | SFBGS001LC04Ext02 | Dazra Outskirts — Exterior (-9, 9) | Worldspace: SFBGS001DazraWorld (shatteredspace.esm:0470CB) |
| shatteredspace.esm:076303 | SFBGS001LC04Ext03 | Dazra Outskirts — Exterior (-9, 10) | Worldspace: SFBGS001DazraWorld (shatteredspace.esm:0470CB) |
| shatteredspace.esm:04710B | SFBGS001LC05Ext | Ma'leen Dam — Exterior (9, -5) | Linked location: SFBGS001LC05ResearchSiteLocation (shatteredspace.esm:02E265) |
| shatteredspace.esm:05ACB0 | SFBGS001LC05Ext02 | Ma'leen Dam — Exterior (9, -6) | Linked location: SFBGS001LC05ResearchSiteLocation (shatteredspace.esm:02E265) |
| shatteredspace.esm:05ACB4 | SFBGS001LC05Ext03 | Dazra Outskirts — Exterior (8, -6) | Worldspace: SFBGS001DazraWorld (shatteredspace.esm:0470CB) |
| shatteredspace.esm:05ACB3 | SFBGS001LC05Ext04 | Dazra Outskirts — Exterior (8, -5) | Worldspace: SFBGS001DazraWorld (shatteredspace.esm:0470CB) |
| shatteredspace.esm:0470D1 | SFBGS001LC06Ext | Scaled Citadel — Exterior (3, 0) | Linked location: SFBGS001LC06ScaledCitadelExteriorLocation (shatteredspace.esm:0FBA35) |
| shatteredspace.esm:0485E0 | SFBGS001LC06Ext02 | Scaled Citadel — Exterior (3, -1) | Linked location: SFBGS001LC06ScaledCitadelExteriorLocation (shatteredspace.esm:0FBA35) |
| shatteredspace.esm:0485D6 | SFBGS001LC06Ext03 | Scaled Citadel — Exterior (4, 0) | Linked location: SFBGS001LC06ScaledCitadelExteriorLocation (shatteredspace.esm:0FBA35) |
| shatteredspace.esm:0485D9 | SFBGS001LC06Ext04 | Scaled Citadel — Exterior (3, 1) | Linked location: SFBGS001LC06ScaledCitadelExteriorLocation (shatteredspace.esm:0FBA35) |
| shatteredspace.esm:0485D5 | SFBGS001LC06Ext05 | Scaled Citadel — Exterior (4, 1) | Linked location: SFBGS001LC06ScaledCitadelExteriorLocation (shatteredspace.esm:0FBA35) |
| shatteredspace.esm:04710D | SFBGS001LC07Ext | Deep Gorge Refinery — Exterior (10, -10) | Linked location: SFBGS001LC07ExtLocation (shatteredspace.esm:023B2B) |
| shatteredspace.esm:0474B2 | SFBGS001LC07Ext02 | Deep Gorge Refinery — Exterior (10, -11) | Linked location: SFBGS001LC07ExtLocation (shatteredspace.esm:023B2B) |
| shatteredspace.esm:079E62 | SFBGS001LC07Ext03 | Deep Gorge Refinery — Exterior (9, -11) | Linked location: SFBGS001LC07ExtLocation (shatteredspace.esm:023B2B) |
| shatteredspace.esm:079E61 | SFBGS001LC07Ext04 | Deep Gorge Refinery — Exterior (9, -10) | Linked location: SFBGS001LC07ExtLocation (shatteredspace.esm:023B2B) |
| shatteredspace.esm:04C1F3 | SFBGS001LC08Ext | Misthaze Cavern — Exterior (7, -1) | Linked location: SFBGS001LC08WaterfallCaveLocation (shatteredspace.esm:00F189) |
| shatteredspace.esm:05F5D5 | SFBGS001LC10Ext | Dazra Outskirts — Exterior (-6, 9) | Worldspace: SFBGS001DazraWorld (shatteredspace.esm:0470CB) |
| shatteredspace.esm:05F5D7 | SFBGS001LC10Ext02 | Abandoned Outpost — Exterior (-5, 9) | Linked location: SFBGS001LC10Location (shatteredspace.esm:017A03) |
| shatteredspace.esm:05F5D8 | SFBGS001LC10Ext03 | Abandoned Outpost — Exterior (-5, 10) | Linked location: SFBGS001LC10Location (shatteredspace.esm:017A03) |
| shatteredspace.esm:05B192 | SFBGS001LC10Ext04 | Abandoned Outpost — Exterior (-4, 10) | Linked location: SFBGS001LC10Location (shatteredspace.esm:017A03) |
| shatteredspace.esm:04C20B | SFBGS001LC10Ext05 | Abandoned Outpost — Exterior (-4, 9) | Linked location: SFBGS001LC10Location (shatteredspace.esm:017A03) |
| shatteredspace.esm:04C1F6 | SFBGS001LC12Ext01 | Abandoned Camp — Exterior (-8, 3) | Linked location: SFBGS001LC12Location (shatteredspace.esm:03D50E) |
| shatteredspace.esm:07A0F1 | SFBGS001LC12Ext02 | Abandoned Camp — Exterior (-7, 2) | Linked location: SFBGS001LC12Location (shatteredspace.esm:03D50E) |
| shatteredspace.esm:04C204 | SFBGS001LC13Ext01 | Irina's Farm — Exterior (-10, 6) | Linked location: SFBGS001LC13Location (shatteredspace.esm:037889) |
| shatteredspace.esm:07A1A8 | SFBGS001LC13Ext02 | Irina's Farm — Exterior (-10, 7) | Linked location: SFBGS001LC13Location (shatteredspace.esm:037889) |
| shatteredspace.esm:06DCC6 | SFBGS001LC15Ext | Abbas Seaweed Farm — Exterior (8, -7) | Linked location: SFBGS001LC15Location (shatteredspace.esm:03D50F) |
| shatteredspace.esm:06DCC4 | SFBGS001LC15Ext02 | Abbas Seaweed Farm — Exterior (9, -7) | Linked location: SFBGS001LC15Location (shatteredspace.esm:03D50F) |
| shatteredspace.esm:06DCC5 | SFBGS001LC15Ext03 | Abbas Seaweed Farm — Exterior (9, -8) | Linked location: SFBGS001LC15Location (shatteredspace.esm:03D50F) |
| shatteredspace.esm:06DCC7 | SFBGS001LC15Ext04 | Abbas Seaweed Farm — Exterior (8, -8) | Linked location: SFBGS001LC15Location (shatteredspace.esm:03D50F) |
| shatteredspace.esm:07F200 | SFBGS001LC17Ext | Tul'Shahk Monastery — Exterior (8, 9) | Linked location: SFBGS001LC17Location (shatteredspace.esm:03D510) |
| shatteredspace.esm:07F1FD | SFBGS001LC17Ext02 | Tul'Shahk Monastery — Exterior (9, 9) | Linked location: SFBGS001LC17Location (shatteredspace.esm:03D510) |
| shatteredspace.esm:07F1FF | SFBGS001LC17Ext04 | Tul'Shahk Monastery — Exterior (8, 10) | Linked location: SFBGS001LC17Location (shatteredspace.esm:03D510) |
| shatteredspace.esm:05B194 | SFBGS001LC17Ext05 | Tul'Shahk Monastery — Exterior (9, 10) | Linked location: SFBGS001LC17Location (shatteredspace.esm:03D510) |
| shatteredspace.esm:076312 | SFBGS001LC18Ext | Subterranean Mal'siir Farm — Exterior (4, -6) | Linked location: SFBGS001LC18Location (shatteredspace.esm:03D511) |
| shatteredspace.esm:057484 | SFBGS001LC18Ext010 | Subterranean Mal'siir Farm — Exterior (3, -5) | Linked location: SFBGS001LC18Location (shatteredspace.esm:03D511) |
| shatteredspace.esm:076313 | SFBGS001LC18Ext05 | Subterranean Mal'siir Farm — Exterior (5, -6) | Linked location: SFBGS001LC18Location (shatteredspace.esm:03D511) |
| shatteredspace.esm:07807C | SFBGS001LC18Ext07 | Subterranean Mal'siir Farm — Exterior (4, -7) | Linked location: SFBGS001LC18Location (shatteredspace.esm:03D511) |
| shatteredspace.esm:07807B | SFBGS001LC18Ext08 | Subterranean Mal'siir Farm — Exterior (5, -7) | Linked location: SFBGS001LC18Location (shatteredspace.esm:03D511) |
| shatteredspace.esm:04C1E6 | SFBGS001LC19Ext | Sundered Stone Depot — Exterior (6, 8) | Linked location: SFBGS001LC19Location (shatteredspace.esm:03CA99) |
| shatteredspace.esm:04C1E4 | SFBGS001LC20Ext | Hollow Bluff Depot — Exterior (-11, -1) | Linked location: SFBGS001LC20Location (shatteredspace.esm:016063) |
| shatteredspace.esm:07E0F4 | SFBGS001LC20Ext01 | Hollow Bluff Depot — Exterior (-11, -2) | Linked location: SFBGS001LC20Location (shatteredspace.esm:016063) |
| shatteredspace.esm:07E0F2 | SFBGS001LC20Ext02 | Hollow Bluff Depot — Exterior (-10, -1) | Linked location: SFBGS001LC20Location (shatteredspace.esm:016063) |
| shatteredspace.esm:07E0F3 | SFBGS001LC20Ext03 | Hollow Bluff Depot — Exterior (-10, -2) | Linked location: SFBGS001LC20Location (shatteredspace.esm:016063) |
| shatteredspace.esm:07E0E7 | SFBGS001LC20Ext04 | Dazra Outskirts — Exterior (-9, -1) | Worldspace: SFBGS001DazraWorld (shatteredspace.esm:0470CB) |
| shatteredspace.esm:07E0E8 | SFBGS001LC20Ext05 | Dazra Outskirts — Exterior (-9, -2) | Worldspace: SFBGS001DazraWorld (shatteredspace.esm:0470CB) |
| shatteredspace.esm:04C1E3 | SFBGS001LC21Ext | Malik's Groat Farm — Exterior (-7, -2) | Linked location: SFBGS001LC21MalikGroatFarmLocation (shatteredspace.esm:03AD99) |
| shatteredspace.esm:04873A | SFBGS001LC22Ext | Wayshrine of Redemption — Exterior (1, 2) | Linked location: SFBGS001LC22Location (shatteredspace.esm:03D512) |
| shatteredspace.esm:04C1EE | SFBGS001LC23Ext | Wayshrine of Strength — Exterior (0, -9) | Linked location: SFBGS001LC23Location (shatteredspace.esm:03D513) |
| shatteredspace.esm:075F99 | SFBGS001LC23Ext02 | Wayshrine of Strength — Exterior (-1, -9) | Linked location: SFBGS001LC23Location (shatteredspace.esm:03D513) |
| shatteredspace.esm:04C1FE | SFBGS001LC24Ext | Wayshrine of Obedience — Exterior (0, 8) | Linked location: SFBGS001LC24Location (shatteredspace.esm:03D514) |
| shatteredspace.esm:0740A1 | SFBGS001LC24Ext02 | Wayshrine of Obedience — Exterior (-1, 8) | Linked location: SFBGS001LC24Location (shatteredspace.esm:03D514) |
| shatteredspace.esm:0740A0 | SFBGS001LC24Ext03 | Wayshrine of Obedience — Exterior (-1, 9) | Linked location: SFBGS001LC24Location (shatteredspace.esm:03D514) |
| shatteredspace.esm:04C1FD | SFBGS001LC24Ext04 | Wayshrine of Obedience — Exterior (0, 9) | Linked location: SFBGS001LC24Location (shatteredspace.esm:03D514) |
| shatteredspace.esm:04C1F2 | SFBGS001LC25Ext | Wayshrine of Devotion — Exterior (8, 3) | Linked location: SFBGS001LC25Location (shatteredspace.esm:03D516) |
| shatteredspace.esm:04C1F9 | SFBGS001LC26Ext | Wayshrine of Perseverance — Exterior (-11, 3) | Linked location: SFBGS001LC26Location (shatteredspace.esm:03D515) |
| shatteredspace.esm:074099 | SFBGS001LC26Ext02 | Wayshrine of Perseverance — Exterior (-10, 3) | Linked location: SFBGS001LC26Location (shatteredspace.esm:03D515) |
| shatteredspace.esm:04C1FA | SFBGS001LC27Ext | Hamadi Station — Exterior (-8, 1) | Linked location: SFBGS001LC27Location (shatteredspace.esm:03D517) |
| shatteredspace.esm:07A0F2 | SFBGS001LC27Ext02 | Hamadi Station — Exterior (-7, 1) | Linked location: SFBGS001LC27Location (shatteredspace.esm:03D517) |
| shatteredspace.esm:04C1E1 | SFBGS001LC28Ext | Chunks — Exterior (-5, -3) | Linked location: SFBGS001LC28Location (shatteredspace.esm:03D518) |
| shatteredspace.esm:04C1ED | SFBGS001LC29Ext | Dazra Groat Farms — Exterior (1, -4) | Linked location: SFBGS001LC29Location (shatteredspace.esm:03D519) |
| shatteredspace.esm:053EF9 | SFBGS001LC29Ext02 | Dazra Outskirts — Exterior (2, -4) | Worldspace: SFBGS001DazraWorld (shatteredspace.esm:0470CB) |
| shatteredspace.esm:0A8B3E | SFBGS001LC29Ext03 | Dazra Groat Farms — Exterior (1, -5) | Linked location: SFBGS001LC29Location (shatteredspace.esm:03D519) |
| shatteredspace.esm:0C6AF0 | SFBGS001LC32Ext | Dazra Seaweed Farms — Exterior (-4, 1) | Linked location: SFBGS001LC32Location (shatteredspace.esm:03D51C) |
| shatteredspace.esm:0478DA | SFBGS001LC32Ext02 | Dazra Seaweed Farms — Exterior (-4, 0) | Linked location: SFBGS001LC32Location (shatteredspace.esm:03D51C) |
| shatteredspace.esm:04C1EB | SFBGS001LC36Ext | Listening Post Alpha — Exterior (-9, -11) | Linked location: SFBGS001LC36Location (shatteredspace.esm:03D522) |
| shatteredspace.esm:070E17 | SFBGS001LC36Ext02 | Listening Post Alpha — Exterior (-9, -10) | Linked location: SFBGS001LC36Location (shatteredspace.esm:03D522) |
| shatteredspace.esm:070E16 | SFBGS001LC36Ext03 | Dazra Outskirts — Exterior (-10, -10) | Worldspace: SFBGS001DazraWorld (shatteredspace.esm:0470CB) |
| shatteredspace.esm:070E18 | SFBGS001LC36Ext04 | Listening Post Alpha — Exterior (-10, -11) | Linked location: SFBGS001LC36Location (shatteredspace.esm:03D522) |
| shatteredspace.esm:04C1F1 | SFBGS001LC37Ext01 | Listening Post Beta — Exterior (6, 2) | Linked location: SFBGS001LC37Location (shatteredspace.esm:03D523) |
| shatteredspace.esm:04C1DE | SFBGS001LC38Ext | Badlands Power Station — Exterior (4, 4) | Linked location: SFBGS001LC38Location (shatteredspace.esm:03D524) |
| shatteredspace.esm:07E12D | SFBGS001LC38Ext02 | Badlands Power Station — Exterior (4, 5) | Linked location: SFBGS001LC38Location (shatteredspace.esm:03D524) |
| shatteredspace.esm:047105 | SFBGS001LC39Ext | Lakelands Power Station — Exterior (4, -9) | Linked location: SFBGS001LC39Location (shatteredspace.esm:03D525) |
| shatteredspace.esm:04C1E0 | SFBGS001LC40Ext | Hillcountry Power Relay — Exterior (-7, -7) | Linked location: SFBGS001LC40Location (shatteredspace.esm:03D526) |
| shatteredspace.esm:04C1FF | SFBGS001LC41Ext | Badlands Power Relay — Exterior (-3, 6) | Linked location: SFBGS001LC41Location (shatteredspace.esm:03D527) |
| shatteredspace.esm:0CDD21 | SFBGS001LC41Ext02 | Badlands Power Relay — Exterior (-4, 6) | Linked location: SFBGS001LC41Location (shatteredspace.esm:03D527) |
| shatteredspace.esm:04C200 | SFBGS001LC42Ext | Spacer Crash Site — Exterior (-6, 7) | Linked location: SFBGS001LC42Location (shatteredspace.esm:03D528) |
| shatteredspace.esm:0ABDE1 | SFBGS001LC42Ext02 | Spacer Crash Site — Exterior (-5, 7) | Linked location: SFBGS001LC42Location (shatteredspace.esm:03D528) |
| shatteredspace.esm:04C1E2 | SFBGS001LC45Ext | Orahim's Shack — Exterior (-5, -5) | Linked location: SFBGS001LC45Location (shatteredspace.esm:03D52B) |
| shatteredspace.esm:0C6AF8 | SFBGS001LC47Ext | Tomb of the Fang — Exterior (-10, -7) | Linked location: SFBGS001LC47Location (shatteredspace.esm:03D52D) |
| shatteredspace.esm:08CC27 | SFBGS001LC48Ext | Control Site Kappa — Exterior (-3, -8) | Linked location: SFBGS001LC48Location (shatteredspace.esm:03D52E) |
| shatteredspace.esm:08D5F5 | SFBGS001LC48Ext03 | Control Site Kappa — Exterior (-4, -8) | Linked location: SFBGS001LC48Location (shatteredspace.esm:03D52E) |
| shatteredspace.esm:08D5F7 | SFBGS001LC48Ext04 | Control Site Kappa — Exterior (-4, -7) | Linked location: SFBGS001LC48Location (shatteredspace.esm:03D52E) |
| shatteredspace.esm:08D5F3 | SFBGS001LC48Ext05 | Control Site Kappa — Exterior (-5, -9) | Linked location: SFBGS001LC48Location (shatteredspace.esm:03D52E) |
| shatteredspace.esm:04C1DC | SFBGS001LC48Ext06 | Control Site Kappa — Exterior (-5, -8) | Linked location: SFBGS001LC48Location (shatteredspace.esm:03D52E) |
| shatteredspace.esm:08D5F6 | SFBGS001LC48Ext07 | Control Site Kappa — Exterior (-5, -7) | Linked location: SFBGS001LC48Location (shatteredspace.esm:03D52E) |
| shatteredspace.esm:04C1DD | SFBGS001LC48Ext08 | Control Site Kappa — Exterior (-5, -10) | Linked location: SFBGS001LC48Location (shatteredspace.esm:03D52E) |
| shatteredspace.esm:08D5F4 | SFBGS001LC48Ext09 | Control Site Kappa — Exterior (-4, -9) | Linked location: SFBGS001LC48Location (shatteredspace.esm:03D52E) |
| shatteredspace.esm:090BC6 | SFBGS001LC48Ext10 | Dazra Outskirts — Exterior (-3, -10) | Worldspace: SFBGS001DazraWorld (shatteredspace.esm:0470CB) |
| shatteredspace.esm:0B67AD | SFBGS001LC49AExt | Dazra Outskirts — Exterior (-8, 5) | Worldspace: SFBGS001DazraWorld (shatteredspace.esm:0470CB) |
| shatteredspace.esm:06133C | SFBGS001LC49BExt | Dazra Outskirts — Exterior (1, 6) | Worldspace: SFBGS001DazraWorld (shatteredspace.esm:0470CB) |
| shatteredspace.esm:04C1E9 | SFBGS001LC49CExt | Dazra Outskirts — Exterior (8, -10) | Worldspace: SFBGS001DazraWorld (shatteredspace.esm:0470CB) |
| shatteredspace.esm:0969CC | SFBGS001LC49DExt | Dazra Outskirts — Exterior (5, -3) | Worldspace: SFBGS001DazraWorld (shatteredspace.esm:0470CB) |
| shatteredspace.esm:050AD0 | SFBGS001LC49EExt | Dazra Outskirts — Exterior (-6, -10) | Worldspace: SFBGS001DazraWorld (shatteredspace.esm:0470CB) |
| shatteredspace.esm:04C1DF | SFBGS001LC50Ext | Vaifala Crash Site — Exterior (2, -11) | Linked location: SFBGS001LC50Location (shatteredspace.esm:03D530) |
| shatteredspace.esm:04C271 | SFBGS001LC53Ext | Hermit Groat Farm — Exterior (-1, -3) | Linked location: SFBGS001LC53Location (shatteredspace.esm:11A35D) |
| shatteredspace.esm:11A138 | SFBGS001LC53Ext02 | Hermit Groat Farm — Exterior (-2, -3) | Linked location: SFBGS001LC53Location (shatteredspace.esm:11A35D) |
| shatteredspace.esm:04C24C | SFBGS001LC53Ext03 | Hermit Groat Farm — Exterior (-1, -4) | Linked location: SFBGS001LC53Location (shatteredspace.esm:11A35D) |
| shatteredspace.esm:04C276 | SFBGS001LC54Ext | Orm Filtration Facility — Exterior (-2, -1) | Linked location: SFBGS001LC54Location (shatteredspace.esm:114CD0) |
| shatteredspace.esm:04C279 | SFBGS001LC54Ext02 | Orm Filtration Facility — Exterior (-1, -1) | Linked location: SFBGS001LC54Location (shatteredspace.esm:114CD0) |
| shatteredspace.esm:04C27A | SFBGS001LC54Ext03 | Orm Filtration Facility — Exterior (-1, 0) | Linked location: SFBGS001LC54Location (shatteredspace.esm:114CD0) |
| shatteredspace.esm:052B30 | SFBGS001LC55Ext01 | Lake Watchtower — Exterior (-4, -1) | Linked location: SFBGS001LC55Location (shatteredspace.esm:112527) |
| shatteredspace.esm:0AAB07 | SFBGS001LC57Ext01 | Oasis Watch Tower — Exterior (1, 0) | Linked location: SFBGS001LC57Location (shatteredspace.esm:113CB0) |
| shatteredspace.esm:04100A | SFBGS001LC58Ext | Overlook Watchtower — Exterior (0, -3) | Linked location: SFBGS001LC58Location (shatteredspace.esm:118813) |
| shatteredspace.esm:046D0E | SFBGS001LC58Ext03 | Overlook Watchtower — Exterior (-1, -3) | Linked location: SFBGS001LC58Location (shatteredspace.esm:118813) |
| shatteredspace.esm:046D0D | SFBGS001LC58Ext04 | Overlook Watchtower — Exterior (-1, -2) | Linked location: SFBGS001LC58Location (shatteredspace.esm:118813) |
| shatteredspace.esm:072BA2 | SFBGS001LC59Ext01 | Ridgeline Watchtower — Exterior (0, 0) | Linked location: SFBGS001LC59Location (shatteredspace.esm:118814) |
| shatteredspace.esm:072BA4 | SFBGS001LC59Ext02 | Ridgeline Watchtower — Exterior (1, 0) | Linked location: SFBGS001LC59Location (shatteredspace.esm:118814) |
| shatteredspace.esm:072BA5 | SFBGS001LC59Ext03 | Ridgeline Watchtower — Exterior (1, 1) | Linked location: SFBGS001LC59Location (shatteredspace.esm:118814) |
| shatteredspace.esm:072BA1 | SFBGS001LC59Ext04 | Ridgeline Watchtower — Exterior (0, 1) | Linked location: SFBGS001LC59Location (shatteredspace.esm:118814) |
| shatteredspace.esm:10E348 | SFBGS001LC60Int | Anomalous Cave — Interior | Linked location: SFBGS001_MQIN_Location (shatteredspace.esm:10DE92) |
| shatteredspace.esm:04C278 | SFBGS001LD54Ext04 | Orm Filtration Facility — Exterior (-2, 0) | Linked location: SFBGS001LC54Location (shatteredspace.esm:114CD0) |
| shatteredspace.esm:04C272 | SFBGS001LD54Ext06 | Orm Filtration Facility — Exterior (0, 0) | Linked location: SFBGS001LC54Location (shatteredspace.esm:114CD0) |
| shatteredspace.esm:0F0128 | SFBGS001OE07 | Hoodoo Rock Camp — Exterior (-1, 0) | Linked location: SFBGS001OE07Location (shatteredspace.esm:0F0159) |
| shatteredspace.esm:0F0121 | SFBGS001OE12Ext01 | Va'ruun Camp — Exterior (-1, 0) | Linked location: SFBGS001OE12Location (shatteredspace.esm:0F0158) |
| shatteredspace.esm:0F6F76 | SFBGS001OE15Ext01 | Gas Extraction Site — Exterior (-1, -1) | Linked location: SFBGS001OE15Location (shatteredspace.esm:0F7083) |
| shatteredspace.esm:0F6F74 | SFBGS001OE15Ext02 | Gas Extraction Site — Exterior (-1, 0) | Linked location: SFBGS001OE15Location (shatteredspace.esm:0F7083) |
| shatteredspace.esm:0F6F75 | SFBGS001OE19Ext01 | Crashed Ship — Exterior (-1, -1) | Linked location: SFBGS001OE19Location (shatteredspace.esm:0F7085) |
| shatteredspace.esm:0F6F72 | SFBGS001OE19Ext02 | Crashed Ship — Exterior (0, -1) | Linked location: SFBGS001OE19Location (shatteredspace.esm:0F7085) |
| shatteredspace.esm:0F6F6F | SFBGS001OE19Ext03 | Crashed Ship — Exterior (-1, 0) | Linked location: SFBGS001OE19Location (shatteredspace.esm:0F7085) |
| shatteredspace.esm:078F1A | SFBGS001POI01Ext | Sniper Nest — Exterior (4, -1) | Linked location: SFBGS001POI01Location (shatteredspace.esm:027AE9) |
| shatteredspace.esm:078F18 | SFBGS001POI01Ext02 | Sniper Nest — Exterior (4, 0) | Linked location: SFBGS001POI01Location (shatteredspace.esm:027AE9) |
| shatteredspace.esm:078F1B | SFBGS001POI02Ext | Target Range — Exterior (4, -2) | Linked location: SFBGS001POI02Location (shatteredspace.esm:027AED) |
| shatteredspace.esm:15568E | SFBGS001POI03Ext | Courier Center — Exterior (-5, -1) | Linked location: SFBGS001POI03Location (shatteredspace.esm:025502) |
| shatteredspace.esm:057487 | SFBGS001POI04Ext | Lakeside Dock — Exterior (-4, 3) | Linked location: SFBGS001POI04Location (shatteredspace.esm:034FD1) |
| shatteredspace.esm:052B66 | SFBGS001POI04Ext02 | Lakeside Dock — Exterior (-3, 3) | Linked location: SFBGS001POI04Location (shatteredspace.esm:034FD1) |
| shatteredspace.esm:05BE8F | SFBGS001POI05Ext | Improvised Shelter — Exterior (3, 3) | Linked location: SFBGS001POI05Location (shatteredspace.esm:034FC6) |
| shatteredspace.esm:0485D0 | SFBGS001POIRuins02 | Dazra Outskirts — Exterior (5, 1) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:084C25 | SFBGS001POIRuins03 | Dazra Outskirts — Exterior (3, -3) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:0485D8 | SFBGS001POIRuins04 | Dazra Outskirts — Exterior (3, 2) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:0485DE | SFBGS001POIRuins05 | Dazra Outskirts — Exterior (1, 0) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:0485D7 | SFBGS001POIRuins06 | Dazra Orphanage — Exterior (4, -2) | Linked location: SFBGS001_VkaiZ03_OrphanageLocation (shatteredspace.esm:0E35BA) |
| shatteredspace.esm:0969CD | SFBGS001POIRuins07 | Dazra Outskirts — Exterior (4, -3) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:084C26 | SFBGS001POIRuins08 | Dazra Outskirts — Exterior (2, -3) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:08E4F0 | SFBGS001POIRuins09 | Dazra Outskirts — Exterior (2, -2) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:0901AA | SFBGS001WNPCSpawn01Ext | Dazra Outskirts — Exterior (2, 4) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:05F6F9 | SFBGS001WNPCSpawn02Ext | Dazra Outskirts — Exterior (-2, 4) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:0CB024 | SFBGS001WNPCSpawn03Ext | Dazra Outskirts — Exterior (-6, 4) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:05A5C0 | SFBGS001WNPCSpawn04Ext | Dazra Outskirts — Exterior (-7, -3) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:089A57 | SFBGS001WNPCSpawn05Ext | Dazra Outskirts — Exterior (-5, -6) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:09F625 | SFBGS001WNPCSpawn06Ext | Dazra Outskirts — Exterior (-3, -7) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:05ACB2 | SFBGS001WNPCSpawn07Ext | Dazra Outskirts — Exterior (8, -4) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| shatteredspace.esm:0884EA | SFBGS001WNPCSpawn08Ext | Dazra Outskirts — Exterior (7, 1) | Parent location: SFBGS001DazraWorldLocation (shatteredspace.esm:038D1A) |
| sfbgs00d.esm:00243D | SFBGS00DDR001Ext | Autonomous Waste Processing Plant — Exterior (0, -1) | Worldspace: SFBGS00DDR001World (sfbgs00d.esm:002428) |
| sfbgs00d.esm:00243E | SFBGS00DDR001Ext01 | Autonomous Waste Processing Plant — Exterior (0, 0) | Worldspace: SFBGS00DDR001World (sfbgs00d.esm:002428) |
| sfbgs00d.esm:002442 | SFBGS00DDR001Ext02 | Autonomous Waste Processing Plant — Exterior (-1, 0) | Worldspace: SFBGS00DDR001World (sfbgs00d.esm:002428) |
| sfbgs00d.esm:00243F | SFBGS00DDR001Ext03 | Autonomous Waste Processing Plant — Exterior (-1, -1) | Worldspace: SFBGS00DDR001World (sfbgs00d.esm:002428) |
| sfbgs00d.esm:004C38 | SFBGS00DDR002Ext01 | Ship Stop — Exterior (0, 0) | Worldspace: SFBGS00DDR002World (sfbgs00d.esm:004C35) |
| sfbgs00d.esm:004C3B | SFBGS00DDR002Ext02 | Ship Stop — Exterior (-1, -1) | Worldspace: SFBGS00DDR002World (sfbgs00d.esm:004C35) |
| sfbgs00d.esm:004C3D | SFBGS00DDR002Ext03 | Ship Stop — Exterior (0, -1) | Worldspace: SFBGS00DDR002World (sfbgs00d.esm:004C35) |
| sfbgs00d.esm:004C3C | SFBGS00DDR002Ext04 | Ship Stop — Exterior (-1, 0) | Worldspace: SFBGS00DDR002World (sfbgs00d.esm:004C35) |
| sfbgs00d.esm:007298 | SFBGS00DDR004Ext | Pillaged Colony Outpost — Exterior (0, 0) | Worldspace: SFBGS00DDR004World (sfbgs00d.esm:0049B6) |
| sfbgs00d.esm:006F69 | SFBGS00DDR007Ext | Ambush Outpost — Exterior (0, 0) | Worldspace: SFBGS00DDR007World (sfbgs00d.esm:0034AE) |
| sfbgs00d.esm:00EF40 | SFBGS00DDR008Ext | Lost Research Facility — Exterior (0, 0) | Worldspace: SFBGS00DDR008World (sfbgs00d.esm:00EC6B) |
| sfbgs00d.esm:0076E4 | SFBGS00DDR009Ext01 | Galx-E Trailer Communes — Exterior (0, 0) | Worldspace: SFBGS00DDR009World (sfbgs00d.esm:0056F4) |
| sfbgs00d.esm:00A677 | SFBGS00DDR010Ext01 | Big Iron CQB Training Center — Exterior (0, 0) | Worldspace: SFBGS00DDR010World (sfbgs00d.esm:0056F6) |
| sfbgs00d.esm:0079E6 | SFBGS00DDR011Ext | Wildlife Viewing Station — Exterior (0, 0) | Worldspace: SFBGS00DDR011World (sfbgs00d.esm:006216) |
| sfbgs00d.esm:00873F | SFBGS00DDR013Ext | Defunct Broadcasting Station — Exterior (0, 0) | Worldspace: SFBGS00DDR013World (sfbgs00d.esm:0079E3) |
| sfbgs00d.esm:00E077 | SFBGS00DDR014Ext | Defunct Shipping Facility — Exterior (0, 0) | Worldspace: SFBGS00DDR014World (sfbgs00d.esm:00D189) |
| sfbgs00d.esm:00E076 | SFBGS00DDR014Ext02 | Defunct Shipping Facility — Exterior (0, -1) | Worldspace: SFBGS00DDR014World (sfbgs00d.esm:00D189) |
| sfbgs00d.esm:00E074 | SFBGS00DDR014Ext03 | Defunct Shipping Facility — Exterior (-1, -1) | Worldspace: SFBGS00DDR014World (sfbgs00d.esm:00D189) |
| sfbgs00d.esm:00E075 | SFBGS00DDR014Ext04 | Defunct Shipping Facility — Exterior (-1, 0) | Worldspace: SFBGS00DDR014World (sfbgs00d.esm:00D189) |
| sfbgs00d.esm:008754 | SFBGS00DDR015World Ext | Antiquated Radio Observatory — Exterior (0, 0) | Worldspace: SFBGS00DDR015World (sfbgs00d.esm:00873C) |
| sfbgs00d.esm:0094D0 | SFBGS00DDR016Ext | Isolated Maintenance Hangar — Exterior (0, -1) | Worldspace: SFBGS00DDR016World (sfbgs00d.esm:00874F) |
| sfbgs00d.esm:0094CE | SFBGS00DDR016Ext01 | Isolated Maintenance Hangar — Exterior (0, 0) | Worldspace: SFBGS00DDR016World (sfbgs00d.esm:00874F) |
| sfbgs00d.esm:0094CF | SFBGS00DDR016Ext02 | Isolated Maintenance Hangar — Exterior (-1, -1) | Worldspace: SFBGS00DDR016World (sfbgs00d.esm:00874F) |
| sfbgs00d.esm:0094DC | SFBGS00DDR016Ext03 | Isolated Maintenance Hangar — Exterior (-1, 0) | Worldspace: SFBGS00DDR016World (sfbgs00d.esm:00874F) |
| sfbgs00d.esm:007B6A | SFBGS00DDR017Ext | Greenhouse Farm — Exterior (0, 0) | Worldspace: SFBGS00DDR017World (sfbgs00d.esm:007B67) |
| sfbgs00d.esm:008DD3 | SFBGS00DDR018Ext | Abandoned Tower — Exterior (0, 0) | Linked location: SFBGS00DDR018Location (sfbgs00d.esm:00B8BD) |
| sfbgs00d.esm:011373 | SFBGS00DPOICL01Ext | Crashed Food Truck — Exterior (0, 0) | Worldspace: SFBGS00DPOICL01World (sfbgs00d.esm:010FB8) |
| sfbgs00d.esm:00BF3A | SFBGS00DPOIGN02Ext | Scattered Shipwreck — Exterior (-1, -1) | Worldspace: SFBGS00DPOIGN02World (sfbgs00d.esm:00BF36) |
| sfbgs00d.esm:00BF39 | SFBGS00DPOIGN02Ext02 | Scattered Shipwreck — Exterior (-1, 0) | Worldspace: SFBGS00DPOIGN02World (sfbgs00d.esm:00BF36) |
| sfbgs00d.esm:00CBDB | SFBGS00DPOIGN02Ext03 | Scattered Shipwreck — Exterior (0, 0) | Worldspace: SFBGS00DPOIGN02World (sfbgs00d.esm:00BF36) |
| sfbgs00d.esm:00CBD5 | SFBGS00DPOIGN02Ext04 | Scattered Shipwreck — Exterior (0, -1) | Worldspace: SFBGS00DPOIGN02World (sfbgs00d.esm:00BF36) |
| sfbgs00d.esm:00AA25 | SFBGS00DPOIGN04Ext | Crashed Ship — Exterior (0, 0) | Worldspace: SFBGS00DPOIGN04World (sfbgs00d.esm:00AA22) |
| sfbgs00d.esm:011662 | SFBGS00DPOIYG01Ext | Explorer's Refuge — Exterior (0, 0) | Worldspace: SFBGS00DPOIYG01World (sfbgs00d.esm:01165F) |
| sfbgs00d.esm:023B66 | SFFLDR021x Ext01 | Decommisionned Missile Silo — Exterior (0, 0) | Worldspace: SFFLDR021World (sfbgs00d.esm:021197) |
| sfbgs00d.esm:020482 | SFFLDR022Ext01 | Mineral Farm — Exterior (0, 0) | Worldspace: SFFLDR022World (sfbgs00d.esm:01FA8E) |
| sfbgs00d.esm:025687 | SFFLDR023Ext01 | Meteorite Mine — Exterior (0, -1) | Worldspace: SFFLDR023World (sfbgs00d.esm:025683) |
| sfbgs00d.esm:025686 | SFFLDR023Ext02 | Meteorite Mine — Exterior (0, 0) | Worldspace: SFFLDR023World (sfbgs00d.esm:025683) |
| sfbgs00d.esm:03077C | SFFLDR025Ext01 | Concrete Plant — Exterior (1, -1) | Worldspace: SFFLDR025World (sfbgs00d.esm:0300D5) |
| sfbgs00d.esm:03077A | SFFLDR025Ext02 | Concrete Plant — Exterior (0, -1) | Worldspace: SFFLDR025World (sfbgs00d.esm:0300D5) |
| sfbgs00d.esm:030776 | SFFLDR025Ext03 | Concrete Plant — Exterior (-1, -1) | Worldspace: SFFLDR025World (sfbgs00d.esm:0300D5) |
| sfbgs00d.esm:03077D | SFFLDR025Ext04 | Concrete Plant — Exterior (1, 0) | Worldspace: SFFLDR025World (sfbgs00d.esm:0300D5) |
| sfbgs00d.esm:030774 | SFFLDR025Ext05 | Concrete Plant — Exterior (0, 0) | Worldspace: SFFLDR025World (sfbgs00d.esm:0300D5) |
| sfbgs00d.esm:030778 | SFFLDR025Ext06 | Concrete Plant — Exterior (-1, 1) | Worldspace: SFFLDR025World (sfbgs00d.esm:0300D5) |
| sfbgs00d.esm:030777 | SFFLDR025Ext07 | Concrete Plant — Exterior (-1, 0) | Worldspace: SFFLDR025World (sfbgs00d.esm:0300D5) |
| sfbgs00d.esm:03077B | SFFLDR025Ext08 | Concrete Plant — Exterior (0, 1) | Worldspace: SFFLDR025World (sfbgs00d.esm:0300D5) |
| sfbgs00d.esm:03077E | SFFLDR025Ext09 | Concrete Plant — Exterior (1, 1) | Worldspace: SFFLDR025World (sfbgs00d.esm:0300D5) |
| sfbgs00d.esm:05DC00 | SFFLDR026Ext01 | Illicit Surgery Center — Exterior (0, 0) | Worldspace: SFFLDR026World (sfbgs00d.esm:05DBFE) |
| sfbgs00d.esm:04B50D | SFFLDR027Ship Exterior | Asteroid Prison Mine — Exterior | Linked location: SFFLDR027AsteroidMineLocation (sfbgs00d.esm:04BDB9) |
| sfbgs00d.esm:04B50B | SFFLDR027Ship Interior | Asteroid Prison Mine — Interior | Linked location: SFFLDR027AsteroidMineLocation (sfbgs00d.esm:04BDB9) |
| sfbgs00d.esm:044B2E | SFFLDR028Ship Exterior | RedCap Asteroid Mine — Exterior | Linked location: SFFLDR028AsteroidMineLocation (sfbgs00d.esm:04640F) |
| sfbgs00d.esm:044B2D | SFFLDR028Ship Interior | RedCap Asteroid Mine — Interior | Linked location: SFFLDR028AsteroidMineLocation (sfbgs00d.esm:04640F) |
| sfbgs00d.esm:049D90 | SFFLDR029Interior | Bodach Asteroid Mine Cavern — Interior | Linked location: SFFLDR029AsteroidMineInteriorLocation (sfbgs00d.esm:04AB2E) |
| sfbgs00d.esm:04A289 | SFFLDR029Ship Exterior | Bodach Asteroid Mine — Exterior | Linked location: SFFLDR029AsteroidMineLocation (sfbgs00d.esm:04AB2F) |
| sfbgs00d.esm:04A287 | SFFLDR029Ship Interior | Bodach Asteroid Mine — Interior | Linked location: SFFLDR029AsteroidMineLocation (sfbgs00d.esm:04AB2F) |
| sfbgs00d.esm:0525DA | SFFLM03Home Ext01 | Atka's House — Exterior (0, 0) | Linked location: SFFL_MS03AtkaHouseLocation (sfbgs00d.esm:0358F5) |
| sfbgs00d.esm:0525DD | SFFLM03Home Ext02 | Atka's House — Exterior (-1, 0) | Linked location: SFFL_MS03AtkaHouseLocation (sfbgs00d.esm:0358F5) |
| sfbgs00d.esm:0525DE | SFFLM03Home Ext03 | Atka's House — Exterior (-1, -1) | Linked location: SFFL_MS03AtkaHouseLocation (sfbgs00d.esm:0358F5) |
| sfbgs00d.esm:0525DB | SFFLM03Home Ext04 | Atka's House — Exterior (0, -1) | Linked location: SFFL_MS03AtkaHouseLocation (sfbgs00d.esm:0358F5) |
| sfbgs00d.esm:021248 | SFFL_MS01 Non-Instanced Refs | Test Cell — Storage Cell | Linked location: SFFL_MS01_Location_TestCell (sfbgs00d.esm:02209C) |
| sfbgs00d.esm:0525DF | SFFLOEAF09Ext | Old Maintenance Garage — Exterior (0, 0) | Worldspace: SFFLOEAF09World (sfbgs00d.esm:0525D4) |
| sfbgs00d.esm:044616 | SFFLOESM03Ext01 | Industrialized Farm — Exterior (0, 0) | Worldspace: SFFLOESM06World (sfbgs00d.esm:044613) |
| sfbgs00d.esm:036F6E | SFFLOESM04Ext01 | Scrap Metal Foundry — Exterior (0, -1) | Worldspace: SFFLOESM04World (sfbgs00d.esm:03625A) |
| sfbgs00d.esm:036F6B | SFFLOESM04Ext02 | Scrap Metal Foundry — Exterior (-1, 0) | Worldspace: SFFLOESM04World (sfbgs00d.esm:03625A) |
| sfbgs00d.esm:036F66 | SFFLOESM04Ext03 | Scrap Metal Foundry — Exterior (0, 0) | Worldspace: SFFLOESM04World (sfbgs00d.esm:03625A) |
| sfbgs00d.esm:036F6A | SFFLOESM04Ext04 | Scrap Metal Foundry — Exterior (-1, -1) | Worldspace: SFFLOESM04World (sfbgs00d.esm:03625A) |
| sfbgs050.esm:01931B | SFTERAssault Platform Ext01 | Terran Reclaimer — Exterior (-1, -1) | Worldspace: SFTERAssaultPlatformWorld01 (sfbgs050.esm:00558B) |
| sfbgs050.esm:038811 | SFTERDR001Ext01 | Santos Homestead — Exterior (0, 0) | Worldspace: SFTERDR001World (sfbgs050.esm:02BB85) |
| sfbgs050.esm:02BA0A | SFTERDrop Pod001Ext | Drop Pod Landing Site — Exterior (0, 0) | Worldspace: SFTERDropPod001World (sfbgs050.esm:02B29F) |
| sfbgs050.esm:02BA0C | SFTERDrop Pod001Ext01 | Drop Pod Landing Site — Exterior (-1, 0) | Worldspace: SFTERDropPod001World (sfbgs050.esm:02B29F) |
| sfbgs050.esm:02BA0D | SFTERDrop Pod001Ext02 | Drop Pod Landing Site — Exterior (0, -1) | Worldspace: SFTERDropPod001World (sfbgs050.esm:02B29F) |
| sfbgs050.esm:02BA0B | SFTERDrop Pod001Ext03 | Drop Pod Landing Site — Exterior (-1, -1) | Worldspace: SFTERDropPod001World (sfbgs050.esm:02B29F) |
| sfbgs050.esm:034636 | SFTERDrop Pod002Ext | Drop Pod Landing Site — Exterior (0, 0) | Worldspace: SFTERDropPod002World (sfbgs050.esm:031E8D) |
| sfbgs050.esm:034634 | SFTERDrop Pod002Ext01 | Drop Pod Landing Site — Exterior (-1, 0) | Worldspace: SFTERDropPod002World (sfbgs050.esm:031E8D) |
| sfbgs050.esm:034635 | SFTERDrop Pod002Ext02 | Drop Pod Landing Site — Exterior (-1, -1) | Worldspace: SFTERDropPod002World (sfbgs050.esm:031E8D) |
| sfbgs050.esm:034633 | SFTERDrop Pod002Ext03 | Drop Pod Landing Site — Exterior (0, -1) | Worldspace: SFTERDropPod002World (sfbgs050.esm:031E8D) |
| sfbgs050.esm:03462E | SFTERDrop Pod003Ext | Drop Pod Landing Site — Exterior (0, 0) | Worldspace: SFTERDropPod003World (sfbgs050.esm:031E8F) |
| sfbgs050.esm:034630 | SFTERDrop Pod003Ext01 | Drop Pod Landing Site — Exterior (0, -1) | Worldspace: SFTERDropPod003World (sfbgs050.esm:031E8F) |
| sfbgs050.esm:034632 | SFTERDrop Pod003Ext02 | Drop Pod Landing Site — Exterior (-1, -1) | Worldspace: SFTERDropPod003World (sfbgs050.esm:031E8F) |
| sfbgs050.esm:034631 | SFTERDrop Pod003Ext03 | Drop Pod Landing Site — Exterior (-1, 0) | Worldspace: SFTERDropPod003World (sfbgs050.esm:031E8F) |
| sfbgs050.esm:03462A | SFTERDrop Pod004Ext | Drop Pod Landing Site — Exterior (0, 0) | Worldspace: SFTERDropPod004World (sfbgs050.esm:031E91) |
| sfbgs050.esm:03462C | SFTERDrop Pod004Ext01 | Drop Pod Landing Site — Exterior (0, -1) | Worldspace: SFTERDropPod004World (sfbgs050.esm:031E91) |
| sfbgs050.esm:03462F | SFTERDrop Pod004Ext02 | Drop Pod Landing Site — Exterior (-1, -1) | Worldspace: SFTERDropPod004World (sfbgs050.esm:031E91) |
| sfbgs050.esm:03462D | SFTERDrop Pod004Ext03 | Drop Pod Landing Site — Exterior (-1, 0) | Worldspace: SFTERDropPod004World (sfbgs050.esm:031E91) |
| sfbgs050.esm:034626 | SFTERDrop Pod005Ext | Drop Pod Landing Site — Exterior (0, 0) | Worldspace: SFTERDropPod005World (sfbgs050.esm:031E96) |
| sfbgs050.esm:034629 | SFTERDrop Pod005Ext01 | Drop Pod Landing Site — Exterior (-1, 0) | Worldspace: SFTERDropPod005World (sfbgs050.esm:031E96) |
| sfbgs050.esm:03462B | SFTERDrop Pod005Ext02 | Drop Pod Landing Site — Exterior (-1, -1) | Worldspace: SFTERDropPod005World (sfbgs050.esm:031E96) |
| sfbgs050.esm:034628 | SFTERDrop Pod005Ext03 | Drop Pod Landing Site — Exterior (0, -1) | Worldspace: SFTERDropPod005World (sfbgs050.esm:031E96) |
| sfbgs050.esm:034622 | SFTERDrop Pod006Ext | Drop Pod Landing Site — Exterior (0, 0) | Worldspace: SFTERDropPod006World (sfbgs050.esm:031E98) |
| sfbgs050.esm:034625 | SFTERDrop Pod006Ext01 | Drop Pod Landing Site — Exterior (-1, 0) | Worldspace: SFTERDropPod006World (sfbgs050.esm:031E98) |
| sfbgs050.esm:034627 | SFTERDrop Pod006Ext02 | Drop Pod Landing Site — Exterior (-1, -1) | Worldspace: SFTERDropPod006World (sfbgs050.esm:031E98) |
| sfbgs050.esm:034624 | SFTERDrop Pod006Ext03 | Drop Pod Landing Site — Exterior (0, -1) | Worldspace: SFTERDropPod006World (sfbgs050.esm:031E98) |
| sfbgs050.esm:03461E | SFTERDrop Pod007Ext | Drop Pod Landing Site — Exterior (0, 0) | Worldspace: SFTERDropPod007World (sfbgs050.esm:031E9A) |
| sfbgs050.esm:034620 | SFTERDrop Pod007Ext01 | Drop Pod Landing Site — Exterior (0, -1) | Worldspace: SFTERDropPod007World (sfbgs050.esm:031E9A) |
| sfbgs050.esm:034623 | SFTERDrop Pod007Ext02 | Drop Pod Landing Site — Exterior (-1, -1) | Worldspace: SFTERDropPod007World (sfbgs050.esm:031E9A) |
| sfbgs050.esm:034621 | SFTERDrop Pod007Ext03 | Drop Pod Landing Site — Exterior (-1, 0) | Worldspace: SFTERDropPod007World (sfbgs050.esm:031E9A) |
| sfbgs050.esm:03461A | SFTERDrop Pod008Ext | Drop Pod Landing Site — Exterior (0, 0) | Worldspace: SFTERDropPod008World (sfbgs050.esm:031E9C) |
| sfbgs050.esm:03461C | SFTERDrop Pod008Ext01 | Drop Pod Landing Site — Exterior (0, -1) | Worldspace: SFTERDropPod008World (sfbgs050.esm:031E9C) |
| sfbgs050.esm:03461F | SFTERDrop Pod008Ext02 | Drop Pod Landing Site — Exterior (-1, -1) | Worldspace: SFTERDropPod008World (sfbgs050.esm:031E9C) |
| sfbgs050.esm:03461D | SFTERDrop Pod008Ext03 | Drop Pod Landing Site — Exterior (-1, 0) | Worldspace: SFTERDropPod008World (sfbgs050.esm:031E9C) |
| sfbgs050.esm:034616 | SFTERDrop Pod009Ext | Drop Pod Landing Site — Exterior (0, 0) | Worldspace: SFTERDropPod009World (sfbgs050.esm:031E9E) |
| sfbgs050.esm:034618 | SFTERDrop Pod009Ext01 | Drop Pod Landing Site — Exterior (0, -1) | Worldspace: SFTERDropPod009World (sfbgs050.esm:031E9E) |
| sfbgs050.esm:03461B | SFTERDrop Pod009Ext02 | Drop Pod Landing Site — Exterior (-1, -1) | Worldspace: SFTERDropPod009World (sfbgs050.esm:031E9E) |
| sfbgs050.esm:034619 | SFTERDrop Pod009Ext03 | Drop Pod Landing Site — Exterior (-1, 0) | Worldspace: SFTERDropPod009World (sfbgs050.esm:031E9E) |
| sfbgs050.esm:034613 | SFTERDrop Pod010Ext | Drop Pod Landing Site — Exterior (0, 0) | Worldspace: SFTERDropPod010World (sfbgs050.esm:031EA0) |
| sfbgs050.esm:034614 | SFTERDrop Pod010Ext01 | Drop Pod Landing Site — Exterior (0, -1) | Worldspace: SFTERDropPod010World (sfbgs050.esm:031EA0) |
| sfbgs050.esm:034617 | SFTERDrop Pod010Ext02 | Drop Pod Landing Site — Exterior (-1, -1) | Worldspace: SFTERDropPod010World (sfbgs050.esm:031EA0) |
| sfbgs050.esm:034615 | SFTERDrop Pod010Ext03 | Drop Pod Landing Site — Exterior (-1, 0) | Worldspace: SFTERDropPod010World (sfbgs050.esm:031EA0) |
| sfbgs050.esm:03552D | SFTERDrop Pod011Ext | Overrun Colony Outpost — Exterior (0, 0) | Worldspace: SFTERDropPod011World (sfbgs050.esm:035513) |
| sfbgs050.esm:0743FA | SFTERDrop Pod012Ext | Ransacked Mining Outpost — Exterior (0, 0) | Worldspace: SFTERDropPod012World (sfbgs050.esm:0743DC) |
| sfbgs050.esm:074DB0 | SFTERDrop Pod013Ext | Captured Biochemical Silo — Exterior (0, 0) | Worldspace: SFTERDropPod013World (sfbgs050.esm:074D95) |
| sfbgs050.esm:075124 | SFTERDrop Pod014Ext | Overtaken Military Encampment — Exterior (0, 0) | Worldspace: SFTERDropPod014World (sfbgs050.esm:07510A) |
| sfbgs050.esm:00F9F6 | SFTER Robot Alias Cell | EC Robot Alias Cell — Alias Cell | Linked location: SFTER_EC_RobotAliasCell_Location (sfbgs050.esm:01A10E) |
| sfbgs050.esm:01B11B | SFTERLC001Ship Created Exterior | Opulence of the Stars — Exterior | Linked location: SFTERLC001ShipLocation (sfbgs050.esm:0A5513) |
| sfbgs050.esm:014BB4 | SFTERLC002Asteroid Mine Interior | Machina Forge Prime Cavern — Interior | Linked location: SFTERLC002AsteroidMineInteriorLocation (sfbgs050.esm:031F1F) |
| sfbgs050.esm:014BB2 | SFTERLC002Asteroid Mine Ship Exterior | Machina Forge Prime — Exterior | Linked location: SFTERLC002AsteroidMineLocation (sfbgs050.esm:00B842) |
| sfbgs050.esm:014BB3 | SFTERLC002Asteroid Mine Ship Interior | Machina Forge Prime — Interior | Linked location: SFTERLC002AsteroidMineLocation (sfbgs050.esm:00B842) |
| sfbgs050.esm:005B51 | SFTERLC03Unifier Ship Interior | Unifier — Interior | Linked location: SFTERLC03UnifierShipCellLocation (sfbgs050.esm:01925B) |
| sfbgs050.esm:0AD144 | SFTERMS02Relay Node Ship Exterior | Terran Relay Station — Exterior | Linked location: SFTER_MS02_RelayStationLocation (sfbgs050.esm:07E74B) |
| sfbgs050.esm:0AD143 | SFTERMS02Relay Node Ship Interior | Terran Relay Station — Interior | Linked location: SFTER_MS02_RelayStationLocation (sfbgs050.esm:07E74B) |
| sfbgs050.esm:02BBA9 | SFTEROESD05ext01 | Scrapyard — Exterior (1, -1) | Worldspace: SFTEROESD05World (sfbgs050.esm:02BA34) |
| sfbgs050.esm:02BBAC | SFTEROESD05ext02 | Scrapyard — Exterior (0, -1) | Worldspace: SFTEROESD05World (sfbgs050.esm:02BA34) |
| sfbgs050.esm:02BBB0 | SFTEROESD05ext03 | Scrapyard — Exterior (-1, -1) | Worldspace: SFTEROESD05World (sfbgs050.esm:02BA34) |
| sfbgs050.esm:02BBAF | SFTEROESD05ext04 | Scrapyard — Exterior (-1, 0) | Worldspace: SFTEROESD05World (sfbgs050.esm:02BA34) |
| sfbgs050.esm:02BBB1 | SFTEROESD05ext05 | Scrapyard — Exterior (0, 0) | Worldspace: SFTEROESD05World (sfbgs050.esm:02BA34) |
| sfbgs050.esm:02BBA8 | SFTEROESD05ext06 | Scrapyard — Exterior (1, 0) | Worldspace: SFTEROESD05World (sfbgs050.esm:02BA34) |
| sfbgs050.esm:02BBA7 | SFTEROESD05ext07 | Scrapyard — Exterior (1, 1) | Worldspace: SFTEROESD05World (sfbgs050.esm:02BA34) |
| sfbgs050.esm:02BBAB | SFTEROESD05ext08 | Scrapyard — Exterior (0, 1) | Worldspace: SFTEROESD05World (sfbgs050.esm:02BA34) |
| sfbgs050.esm:02BBAE | SFTEROESD05ext09 | Scrapyard — Exterior (-1, 1) | Worldspace: SFTEROESD05World (sfbgs050.esm:02BA34) |
| sfbgs050.esm:02B00E | SFTEROutpost FCExt01 | Freestar Collective Outpost — Exterior (-1, 0) | Worldspace: SFTEROutpostFCWorld (sfbgs050.esm:02B007) |
| sfbgs050.esm:02B00B | SFTEROutpost FCExt02 | Freestar Collective Outpost — Exterior (-1, -1) | Worldspace: SFTEROutpostFCWorld (sfbgs050.esm:02B007) |
| sfbgs050.esm:02B010 | SFTEROutpost FCExt03 | Freestar Collective Outpost — Exterior (0, -1) | Worldspace: SFTEROutpostFCWorld (sfbgs050.esm:02B007) |
| sfbgs050.esm:02B00A | SFTEROutpost FCExt04 | Freestar Collective Outpost — Exterior (0, 0) | Worldspace: SFTEROutpostFCWorld (sfbgs050.esm:02B007) |
| sfbgs050.esm:02B03E | SFTEROutpost R1Ext01 | Ryujin Industries Outpost — Exterior (-1, -1) | Worldspace: SFTEROutpostRIWorld (sfbgs050.esm:02B032) |
| sfbgs050.esm:02B03F | SFTEROutpost RIExt02 | Ryujin Industries Outpost — Exterior (-1, 0) | Worldspace: SFTEROutpostRIWorld (sfbgs050.esm:02B032) |
| sfbgs050.esm:02B036 | SFTEROutpost RIExt03 | Ryujin Industries Outpost — Exterior (0, 0) | Worldspace: SFTEROutpostRIWorld (sfbgs050.esm:02B032) |
| sfbgs050.esm:02B037 | SFTEROutpost RIExt04 | Ryujin Industries Outpost — Exterior (0, -1) | Worldspace: SFTEROutpostRIWorld (sfbgs050.esm:02B032) |
| sfbgs050.esm:02B079 | SFTEROutpost UCExt01 | United Colonies Outpost — Exterior (-1, -1) | Worldspace: SFTEROutpostUCWorld (sfbgs050.esm:02B062) |
| sfbgs050.esm:02B078 | SFTEROutpost UCExt02 | United Colonies Outpost — Exterior (-1, 0) | Worldspace: SFTEROutpostUCWorld (sfbgs050.esm:02B062) |
| sfbgs050.esm:02B07B | SFTEROutpost UCExt03 | United Colonies Outpost — Exterior (0, 0) | Worldspace: SFTEROutpostUCWorld (sfbgs050.esm:02B062) |
| sfbgs050.esm:02B074 | SFTEROutpost UCExt04 | United Colonies Outpost — Exterior (0, -1) | Worldspace: SFTEROutpostUCWorld (sfbgs050.esm:02B062) |
| sfbgs050.esm:02B45C | SFTERRelay Node Ship Exterior | Terran Repeater — Exterior | Linked location: SFTERRelayStationLocation (sfbgs050.esm:02B45D) |
| sfbgs050.esm:02B45B | SFTERRelay Node Ship Interior | Terran Repeater — Interior | Linked location: SFTERRelayStationLocation (sfbgs050.esm:02B45D) |

## Names still unresolved

This includes 51 cells whose worldspace FULL field is only the internal placeholder LandscapeCutWorldSpace. A second scan of those worldspaces found no named map-marker references. That placeholder is not treated as a recovered place name.

These cells may require live Identify Current Area evidence or deeper quest/ship-template investigation. No named linked location, parent location or worldspace was available; this does not prove the cell is unusable.

| Record | Identifier |
|---|---|
| shatteredspace.esm:05D10D | SFBGS001Dazra OE21Ext |
| shatteredspace.esm:04C280 | SFBGS001LC54Ext05 |
| shatteredspace.esm:03AB72 | SFBGS001s CAttack12 |
| shatteredspace.esm:03ABBC | SFBGS001s CAttack13 |
| sfbgs00d.esm:008EC2 | SFBGS00DDR005Ext01 |
| sfbgs00d.esm:003A32 | SFBGS00DDR006Ext |
| sfbgs00d.esm:003A36 | SFBGS00DDR006Ext2 |
| sfbgs00d.esm:003A34 | SFBGS00DDR006Ext3 |
| sfbgs00d.esm:003A33 | SFBGS00DDR006Ext4 |
| sfbgs00d.esm:02489D | SFFLAnchorpoint Station Exterior |
| sfbgs00d.esm:0248A4 | SFFLAnchorpoint Station Interior |
| sfbgs00d.esm:080D37 | SFFLBERS03Cargo CGeneric Renegade03Template Created Exterior |
| sfbgs00d.esm:080D35 | SFFLBERS03Cargo CGeneric Renegade03Template Created Interior |
| sfbgs00d.esm:05042D | SFFLMS02Ship Created Exterior |
| sfbgs00d.esm:05042B | SFFLMS02Ship Created Interior |
| sfbgs00d.esm:046428 | SFFLOEAR07Ext |
| sfbgs00d.esm:02B9D1 | SFFLOETH01Ext01 |
| sfbgs00d.esm:02B9D0 | SFFLOETH01Ext02 |
| sfbgs00d.esm:02B9D2 | SFFLOETH01Ext03 |
| sfbgs00d.esm:02B9D3 | SFFLOETH01Ext04 |
| sfbgs00d.esm:02A3BC | SFFLOETH02Ext01 |
| sfbgs00d.esm:02A3BD | SFFLOETH02Ext02 |
| sfbgs00d.esm:02A3C0 | SFFLOETH02Ext03 |
| sfbgs00d.esm:02A3BE | SFFLOETH02Ext04 |
| sfbgs00d.esm:03D1C8 | SFFLs CR03 |
| sfbgs00d.esm:047DCF | SFFLSE01Created Exterior |
| sfbgs00d.esm:046856 | SFFLSE01Interior |
| sfbgs00d.esm:040D8D | SFFLSEEC01Cargo Ship Created Exterior |
| sfbgs00d.esm:040D8E | SFFLSEEC01Cargo Ship Created Interior |
| sfbgs00d.esm:072FC3 | SFFLSEEC02Celestial01Created Exterior |
| sfbgs00d.esm:072FC4 | SFFLSEEC02Celestial01Created Interior |
| sfbgs00d.esm:04F924 | SFFLSEEC03Cargo AGeneric MULE01Created Exterior |
| sfbgs00d.esm:04F8FB | SFFLSEEC03Cargo AGeneric MULE01Created Interior |
| sfbgs00d.esm:068043 | SFFLSEEC07Gal Bank Stormrider01Created Exterior |
| sfbgs00d.esm:06800A | SFFLSEEC07Gal Bank Stormrider01Created Interior |
| sfbgs050.esm:043C48 | SFTERAssault Platform001Created Exterior Space |
| sfbgs050.esm:073D30 | SFTERAssault Ship Destroyed002Created Exterior |
| sfbgs050.esm:01AB8D | SFTERAssault Ship001Created Exterior |
| sfbgs050.esm:0AB27A | SFTERAssault Ship001Destroyed Created Exterior |
| sfbgs050.esm:0AB27B | SFTERAssault Ship001Destroyed Created Interior |
| sfbgs050.esm:01AB8F | SFTERAssault Ship001Ship Interior |
| sfbgs050.esm:01AB8C | SFTERAssault Ship002Created Exterior |
| sfbgs050.esm:01AB8E | SFTERAssault Ship002Ship Interior |
| sfbgs050.esm:0AF093 | SFTERLC001ssc Empty Cell |
| sfbgs050.esm:0A0656 | SFTERLC03Unifier Ship Created Exterior |
| sfbgs050.esm:0A38DA | SFTERMQ03Lvl Ship Shield Amplifier Created Exterior |
| sfbgs050.esm:0A38D9 | SFTERMQ03Lvl Ship Shield Amplifier Created Interior |
| sfbgs050.esm:0ABD65 | SFTERMQ03Lvl Ship Shield Amplifier Destroyed Created Exterior |
| sfbgs050.esm:0ABD66 | SFTERMQ03Lvl Ship Shield Amplifier Destroyed Created Interior |
| shatteredspace.esm:0EDF49 | SFBGS001OE01Ext01 |
| shatteredspace.esm:0EDF4C | SFBGS001OE01Ext02 |
| shatteredspace.esm:0EDF4B | SFBGS001OE01Ext03 |
| shatteredspace.esm:0EDF4D | SFBGS001OE01Ext04 |
| shatteredspace.esm:0F566C | SFBGS001OE02Ext01 |
| shatteredspace.esm:0F7161 | SFBGS001OE03Ext01 |
| shatteredspace.esm:0F715F | SFBGS001OE03Ext02 |
| shatteredspace.esm:0F7160 | SFBGS001OE03Ext03 |
| shatteredspace.esm:0F7163 | SFBGS001OE03Ext04 |
| shatteredspace.esm:1116C1 | SFBGS001OE04Ext01 |
| shatteredspace.esm:1116F9 | SFBGS001OE04Ext02 |
| shatteredspace.esm:1116FC | SFBGS001OE04Ext03 |
| shatteredspace.esm:1116FA | SFBGS001OE04Ext04 |
| shatteredspace.esm:0E03A2 | SFBGS001OE05 |
| shatteredspace.esm:0F4148 | SFBGS001OE06Ext01 |
| shatteredspace.esm:0F4145 | SFBGS001OE06Ext02 |
| shatteredspace.esm:0F4144 | SFBGS001OE06Ext03 |
| shatteredspace.esm:0F4147 | SFBGS001OE06Ext04 |
| shatteredspace.esm:106FB8 | SFBGS001OE08Ext01 |
| shatteredspace.esm:106FBB | SFBGS001OE08Ext02 |
| shatteredspace.esm:106FBA | SFBGS001OE08Ext03 |
| shatteredspace.esm:106FB9 | SFBGS001OE08Ext04 |
| shatteredspace.esm:0CB674 | SFBGS001OE09 |
| shatteredspace.esm:0E8151 | SFBGS001OE10Ext01 |
| shatteredspace.esm:0E3D87 | SFBGS001OE10Ext02 |
| shatteredspace.esm:0EC3F6 | SFBGS001OE11Ext01 |
| shatteredspace.esm:0F0129 | SFBGS001OE12Ext02 |
| shatteredspace.esm:10B19D | SFBGS001OE13Ext01 |
| shatteredspace.esm:10B19B | SFBGS001OE13Ext02 |
| shatteredspace.esm:10B19E | SFBGS001OE13Ext03 |
| shatteredspace.esm:10B19C | SFBGS001OE13Ext04 |
| shatteredspace.esm:0EECE2 | SFBGS001OE14Ext01 |
| shatteredspace.esm:0EECE1 | SFBGS001OE14Ext02 |
| shatteredspace.esm:0EECE0 | SFBGS001OE14Ext03 |
| shatteredspace.esm:0F6F73 | SFBGS001OE15Ext03 |
| shatteredspace.esm:1081EF | SFBGS001OE16Ext01 |
| shatteredspace.esm:1081F1 | SFBGS001OE16Ext02 |
| shatteredspace.esm:1081F0 | SFBGS001OE16Ext03 |
| shatteredspace.esm:1081EE | SFBGS001OE16Ext04 |
| shatteredspace.esm:0F57A9 | SFBGS001OE17Ext01 |
| shatteredspace.esm:0F9C58 | SFBGS001OE18Ext01 |
| shatteredspace.esm:0F9C5D | SFBGS001OE18Ext02 |
| shatteredspace.esm:0F9C59 | SFBGS001OE18Ext03 |
| shatteredspace.esm:109AD4 | SFBGS001OE20Ext01 |
| shatteredspace.esm:109AD7 | SFBGS001OE20Ext02 |
| shatteredspace.esm:109AD5 | SFBGS001OE20Ext03 |
| shatteredspace.esm:109AD9 | SFBGS001OE20Ext04 |
| sfbgs00d.esm:00D26C | SFBGS00DPOIGN01Ext |
| sfbgs00d.esm:00D26B | SFBGS00DPOIGN01Ext02 |
| sfbgs00d.esm:0373C3 | SFFLDR024ext01 |
| sfbgs00d.esm:05CCD1 | SFFLPOIYGTESTWorld |
