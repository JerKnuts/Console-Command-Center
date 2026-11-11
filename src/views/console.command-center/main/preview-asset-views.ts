import type {PreviewOrientation} from './preview-orientation.ts';

// Audited installed model paths. Native metadata also covers renamed/modded records.
const MODEL_VIEWS: Record<string, string> = {
  "items/fooddrink_set/fooddrink_set_portablekit_trayopen01.nif": "meal-tray",
  "items/fooddrink_singleitems/all_packaged_consumables/foodpackets_multimeat.nif": "midnight",
  "items/drugs_or_medical/affliction_cures/afflictioncure_antibiotics_green_01.nif": "medical-pouch",
  "items/drugs_or_medical/affliction_cures/afflictioncure_ziipper_bandaids_red_01.nif": "medical-pouch",
  "items/drugs_or_medical/affliction_cures/afflictioncure_heal_paste_red_01.nif": "medical-pouch",
  "items/drugs_or_medical/affliction_cures/afflictioncure_injector_green_01.nif": "medical-pouch",
  "items/drugs_or_medical/affliction_cures/afflictioncure_immobilizer_blue_01.nif": "medical-pouch",
  "items/drugs_or_medical/affliction_cures/afflictioncure_heal_paste_green_01.nif": "medical-pouch",
  "items/drugs_or_medical/affliction_cures/afflictioncure_bandages_red_01.nif": "medical-pouch",
  "items/drugs_or_medical/affliction_cures/afflictioncure_bandages_green_01.nif": "medical-pouch",
  "items/drugs_or_medical/crafted_inhailer_amp_01.nif": "inhaler",
  "items/drugs_or_medical/crafted_inhailer_white.nif": "inhaler",
  "items/drugs_or_medical/crafted_inhailer_steve_01.nif": "inhaler",
  "items/drugs_or_medical/crafted_inhailer_junk_flush_01.nif": "inhaler",
  "items/fooddrink_singleitems/enjoyfooditems/enjoy_foodbox01.nif": "meal-kit",
  "items/drugs_or_medical/crafted_inhailer_02_shot.nif": "inhaler",
  "items/drugs_or_medical/crafted_inhailer_addijack.nif": "inhaler",
  "items/drugs_or_medical/crafted_inhailer_red_amp_01.nif": "inhaler",
  "items/drugs_or_medical/crafted_inhailer_battle_up_01.nif": "inhaler",
  "items/fooddrink_singleitems/marios_special_dumpling/marios special_dumpling.nif": "pierogis",
  "items/fooddrink_singleitems/kiffles/consumable_kiffles.nif": "kiffles",
  "items/fooddrink_singleitems/patty_melt/patty_melt.nif": "patty-melt",
  "items/drugs_or_medical/crafted_inhailer_pick_me_up_01.nif": "inhaler",
  "items/drugs_or_medical/crafted_inhailer_neurajack_01.nif": "inhaler",
  "items/drugs_or_medical/crafted_inhailer_panopticon_01.nif": "inhaler",
  "items/drugs_or_medical/crafted_inhailer_boudica_01.nif": "inhaler",
  "items/drugs_or_medical/crafted_inhailer_frost_wolf.nif": "inhaler",
  "items/drugs_or_medical/crafted_inhailer_penicilinx_01.nif": "inhaler",
  "items/drugs_or_medical/crafted_inhailer_snake_oil_01.nif": "inhaler",
  "items/drugs_or_medical/crafted_inhailer_red_trench_01.nif": "inhaler",
  "items/drugs_or_medical/crafted_inhailer_paramour_01.nif": "inhaler",
  "items/fooddrink_singleitems/all_packaged_consumables/packagedfood_mealpack_chicken.nif": "meal-pack",
  "items/fooddrink_singleitems/all_packaged_consumables/packagedfood_mealpack_shrimp.nif": "meal-pack",
  "items/fooddrink_singleitems/all_packaged_consumables/packagedfood_mealpack_tofu.nif": "meal-pack",
  "items/fooddrink_singleitems/all_packaged_consumables/packagedfood_mealpack_ramen.nif": "meal-pack",
  "items/fooddrink_singleitems/all_packaged_consumables/packagedfood_mealpack_sushi.nif": "meal-pack",
  "items/fooddrink_singleitems/all_packaged_consumables/packagedfood_mealpack_cereal.nif": "meal-pack",
  "items/fooddrink_singleitems/all_packaged_consumables/packagedfood_mealpack_eggs.nif": "meal-pack",
  "items/fooddrink_singleitems/all_packaged_consumables/packagedfood_naanbread.nif": "naan",
  "items/fooddrink_singleitems/all_packaged_consumables/beveragefood_chandracabernet.nif": "wine-bottle",
  "items/fooddrink_singleitems/all_packaged_consumables/beveragefood_chandramelbec.nif": "wine-bottle",
  "items/fooddrink_singleitems/all_packaged_consumables/beveragefood_chardonnay.nif": "wine-bottle",
  "items/fooddrink_singleitems/all_packaged_consumables/beveragefood_chandrariesling.nif": "wine-bottle",
  "items/fooddrink_singleitems/all_packaged_consumables/beveragefood_chandrapinotnoir.nif": "wine-bottle",
  "items/fooddrink_singleitems/all_packaged_consumables/beveragefood_chandrasavigonblanc.nif": "wine-bottle",
  "items/fooddrink_singleitems/all_packaged_consumables/beveragefood_merlot.nif": "wine-bottle",
  "items/fooddrink_singleitems/all_packaged_consumables/beveragefood_chandraport.nif": "wine-bottle",
  "items/fooddrink_singleitems/all_packaged_consumables/packagedfood_sp_apple_slices.nif": "meal-pack",
  "items/fooddrink_singleitems/all_packaged_consumables/packagedfood_sp_proteinbar.nif": "meal-pack",
  "items/fooddrink_singleitems/all_packaged_consumables/packagedfood_sp_chocolatebites.nif": "meal-pack",
  "items/fooddrink_singleitems/all_packaged_consumables/packagedfood_sp_gummibugs.nif": "meal-pack",
  "items/fooddrink_singleitems/all_packaged_consumables/packagedfood_frozen_pizza.nif": "meal-pack",
  "items/fooddrink_singleitems/all_packaged_consumables/packagedfood_spcrackerscheese.nif": "meal-pack",
  "items/fooddrink_singleitems/all_packaged_consumables/packagedfood_oat_clusters.nif": "meal-pack",
  "items/fooddrink_singleitems/all_packaged_consumables/packagedfood_chocolate_labs.nif": "meal-pack",
  "items/fooddrink_singleitems/all_packaged_consumables/packagedfood_spaghetti.nif": "meal-pack",
  "items/fooddrink_singleitems/theedmontonian/food_rs_canuck_edmontonian.nif": "edmontonian",
  "items/fooddrink_singleitems/patechinois/food_rs_canuck_patechinois.nif": "shepherds-pie",
  "items/fooddrink_singleitems/ham_boys/ham_boy.nif": "ham-boys",
  "items/fooddrink_singleitems/thehaligonian/the_haligonian.nif": "haligonian",
  "architecture/outpost/outpostindustrial/interiors/pod/opiind_sandwich02.nif": "bitten-sandwich",
  "items/fooddrink_singleitems/all_crated_consumables/craftedfood_container_alienjerky.nif": "alien-jerky",
  "items/fooddrink_singleitems/foodchunk/chunk_food_empty_pack.nif": "chunks-packaged",
  "items/fooddrink_singleitems/foodchunk/chunk_food_egg_pack.nif": "chunks-packaged",
  "items/fooddrink_singleitems/foodchunk/chunk_food_wine_pack.nif": "chunks-packaged",
  "items/fooddrink_singleitems/foodchunk/chunk_food_pumpkinpie_pack.nif": "chunks-packaged",
  "items/fooddrink_singleitems/foodchunk/chunk_food_potato_pack.nif": "chunks-packaged",
  "items/fooddrink_singleitems/foodchunk/chunk_food_cola_pack.nif": "chunks-packaged",
  "items/fooddrink_singleitems/foodchunk/chunk_food_cocolate_pack.nif": "chunks-packaged",
  "items/fooddrink_singleitems/foodchunk/chunk_food_chicken_pack.nif": "chunks-packaged",
  "items/fooddrink_singleitems/foodchunk/chunk_food_cheesesteak_pack.nif": "chunks-packaged",
  "items/fooddrink_singleitems/foodchunk/chunk_food_cheesecake_pack.nif": "chunks-packaged",
  "items/fooddrink_singleitems/foodchunk/chunk_food_beef_pack.nif": "chunks-packaged",
  "items/fooddrink_singleitems/foodchunk/chunk_food_apple_pack.nif": "chunks-packaged",
  "items/fooddrink_singleitems/bartschilli/bartschilli_01.nif": "food-bowl",
  "items/fooddrink_singleitems/fried_pickles/food_rs_tavern_friedpickles.nif": "fried-pickles",
  "items/dlc001/food/groatpie/sfbgs001_groatpie01.nif": "groat-pie",
  "items/dlc001/food/groatmeat/sfbgs001_packagedfood_groatmeat01.nif": "groat-meat",
  "items/dlc001/food/groatchunk/sfbgs001_chunk_groatmeat_pack01.nif": "chunks-packaged",
  "items/fooddrink_singleitems/foodpackets_crystalpouch/foodpackets_crystalpouch.nif": "fullfood-pouch",
  "items/foodpackets_foodpouch.nif": "fullfood-pouch",
  "items/drugs_or_medical/chem_heartplus.nif": "heart-plus",
  "items/drugs_or_medical/chem_addichrone.nif": "heart-plus",
  "items/drugs_or_medical/chem_cqb-x.nif": "pill-bottle",
  "items/drugs_or_medical/chem_hippolyta.nif": "pill-bottle",
  "items/drugs_or_medical/chem_whiteout_01.nif": "squall",
  "items/drugs_or_medical/chem_squall_01.nif": "squall",
  "items/fooddrink_singleitems/all_crated_consumables/craftedfood_container_chapaguri.nif": "takeout-container",
  "items/fooddrink_singleitems/all_crated_consumables/craftedfood_container_chickenmarsala.nif": "takeout-container",
  "items/fooddrink_singleitems/all_crated_consumables/craftedfood_container_dorowat.nif": "takeout-container",
  "items/fooddrink_singleitems/sweetrolls_packaged/craftedfood_container_sweetrolls.nif": "takeout-container",
  "items/fooddrink_singleitems/all_crated_consumables/craftedfood_container_meatloaf.nif": "takeout-container",
  "items/fooddrink_singleitems/all_crated_consumables/craftedfood_container_aliensandwhich.nif": "takeout-container",
  "items/fooddrink_singleitems/all_crated_consumables/craftedfood_container_latkes.nif": "takeout-container",
  "architecture/outpost/outpostindustrial/interiors/pod/opiind_sandwich01.nif": "sandwich",
  "items/fooddrink_singleitems/all_crated_consumables/craftedfood_container_barbacoawrap.nif": "takeout-container",
  "items/fooddrink_singleitems/all_crated_consumables/craftedfood_container_ruben.nif": "takeout-container",
  "items/fooddrink_singleitems/all_crated_consumables/craftedfood_container_madras_lentils.nif": "takeout-container",
  "items/fooddrink_singleitems/all_crated_consumables/craftedfood_container_bolognese.nif": "takeout-container",
  "items/fooddrink_singleitems/all_crated_consumables/craftedfood_container_carbonara.nif": "takeout-container",
  "items/fooddrink_singleitems/all_crated_consumables/craftedfood_container_chickentikka.nif": "takeout-container",
  "items/fooddrink_singleitems/all_crated_consumables/craftedfood_container_grillcheese.nif": "takeout-container",
  "items/fooddrink_singleitems/all_crated_consumables/craftedfood_container_creaturewurst.nif": "takeout-container",
  "items/fooddrink_singleitems/all_crated_consumables/craftedfood_container_aliennuggets.nif": "takeout-container",
  "items/fooddrink_singleitems/all_crated_consumables/craftedfood_container_alienpie.nif": "takeout-container",
  "items/fooddrink_singleitems/all_crated_consumables/craftedfood_container_alienstirfry.nif": "takeout-container",
  "items/fooddrink_singleitems/all_crated_consumables/craftedfood_container_alienscrambledeggs.nif": "takeout-container",
  "items/fooddrink_singleitems/all_crated_consumables/craftedfood_container_alienstew.nif": "takeout-container",
  "items/fooddrink_singleitems/all_crated_consumables/craftedfood_container_hc_sandwhich.nif": "takeout-container",
  "items/dlc001/food/seaweedandeggporridge/sfbgs001_seaweedandeggporridge01.nif": "porridge",
  "items/fooddrink_set/fooddrink_set_fishfillet01.nif": "smoked-fillet",
  "items/fooddrink_set/fooddrink_set_carrykit_container01.nif": "superfood-paste",
  "items/fooddrink_set/fooddrink_set_turkey01.nif": "synthameat",
  "items/fooddrink_set/fooddrink_set_chicken.nif": "synthameat"
};

// Older native builds and offline thumbnail generation use stable editor IDs.
const EDITOR_VIEWS: Record<string, string> = {
  "fooddrink_set_portablekit_trayopen01": "meal-tray",
  "food_butchersbest_multimeat": "midnight",
  "aid_affl_antibiotics_02": "medical-pouch",
  "aid_affl_bandages_02": "medical-pouch",
  "aid_affl_healpaste_02": "medical-pouch",
  "aid_affl_injector_02": "medical-pouch",
  "aid_affl_immobilizer_02": "medical-pouch",
  "aid_affl_multi_antibioticpaste": "medical-pouch",
  "aid_affl_multi_antibioticinjector": "medical-pouch",
  "aid_affl_multi_infusedbandages": "medical-pouch",
  "aid_affl_multi_repairingimmobilizer": "medical-pouch",
  "aid_affl_multi_analgesicpoultice": "medical-pouch",
  "chem_craft_hypergiantheart": "inhaler",
  "chem_craft_giantheart": "inhaler",
  "chem_craft_blackholeheart": "inhaler",
  "chem_craft_supermassiveheart": "inhaler",
  "chem_craft_subgiantheart": "inhaler",
  "chem_craft_dwarfheart": "inhaler",
  "chem_craft_magz_steve": "inhaler",
  "aid_craft_junkflush": "inhaler",
  "food_boxed_generic_mealkit": "meal-kit",
  "chem_craft_magz_o2shot": "inhaler",
  "chem_craft_magz_addijack": "inhaler",
  "chem_craft_magz_redamp": "inhaler",
  "chem_craft_magz_battleup": "inhaler",
  "noclutter_researchui_aid_affl_multi_repairingimmobilizer": "medical-pouch",
  "food_served_generic_mealtray": "meal-tray",
  "food_served_tavern_pierogis": "pierogis",
  "food_served_tavern_kiffles": "kiffles",
  "food_served_tavern_pattymelt": "patty-melt",
  "chem_craft_pickmeup": "inhaler",
  "noclutter_researchui_chem_craft_neurajack": "inhaler",
  "noclutter_researchui_aid_affl_multi_antibioticpaste": "medical-pouch",
  "noclutter_researchui_chem_craft_panopticon": "inhaler",
  "noclutter_researchui_chem_craft_amp": "inhaler",
  "noclutter_researchui_chem_craft_dwarfheart": "inhaler",
  "noclutter_researchui_chem_craft_giantheart": "inhaler",
  "noclutter_researchui_chem_craft_supermassiveheart": "inhaler",
  "noclutter_researchui_aid_craft_boudicca": "inhaler",
  "noclutter_researchui_chem_craft_frostwolf": "inhaler",
  "aid_craft_boudicca": "inhaler",
  "aid_craft_penicillinx": "inhaler",
  "aid_craft_snakeoil": "inhaler",
  "chem_craft_amp": "inhaler",
  "chem_craft_panopticon": "inhaler",
  "chem_craft_redtrench": "inhaler",
  "chem_craft_paramour": "inhaler",
  "chem_craft_neurajack": "inhaler",
  "chem_craft_frostwolf": "inhaler",
  "food_pack_advnutrition_chicken": "meal-pack",
  "food_pack_advnutrition_shrimp": "meal-pack",
  "food_pack_advnutrition_tofu": "meal-pack",
  "food_pack_advnutrition_ramen": "meal-pack",
  "food_pack_advnutrition_sushi": "meal-pack",
  "food_pack_advnutrition_cereal": "meal-pack",
  "food_pack_advnutrition_eggs": "meal-pack",
  "food_pack_generic_midnightdelight": "midnight",
  "food_redharvest_naanbread": "naan",
  "aid_affl_antibiotics_01": "medical-pouch",
  "aid_affl_bandages_01": "medical-pouch",
  "aid_affl_injector_01": "medical-pouch",
  "aid_affl_immobilizer_01": "medical-pouch",
  "aid_affl_healpaste_01": "medical-pouch",
  "drink_alc_bottle_chandra_winecabernet": "wine-bottle",
  "drink_alc_bottle_chandra_winemalbec": "wine-bottle",
  "drink_alc_bottle_chandra_winechard": "wine-bottle",
  "drink_alc_bottle_chandra_wineriesling": "wine-bottle",
  "drink_alc_bottle_chandra_winepinot": "wine-bottle",
  "drink_alc_bottle_chandra_winesavignon": "wine-bottle",
  "drink_alc_bottle_chandra_winemerlot": "wine-bottle",
  "drink_alc_bottle_chandra_wineport": "wine-bottle",
  "food_pack_advnutrition_apples": "meal-pack",
  "food_pack_advnutrition_bar": "meal-pack",
  "food_pack_advnutrition_choco": "meal-pack",
  "food_pack_advnutrition_gummi": "meal-pack",
  "food_centaurimills_pizza": "meal-pack",
  "food_centaurimills_crackers": "meal-pack",
  "food_centaurimills_oatclusters": "meal-pack",
  "food_centaurimills_chocolabs": "meal-pack",
  "food_redharvest_spaghetti": "meal-pack",
  "food_served_canuck_edmontonian": "edmontonian",
  "food_served_canuck_patechinois": "shepherds-pie",
  "food_served_canuck_hamboys": "ham-boys",
  "food_served_canuck_haligonian": "haligonian",
  "food_served_generic_sandwich02": "bitten-sandwich",
  "food_craft_alienjerky": "alien-jerky",
  "fooddrink_set_chunks_empty": "chunks-packaged",
  "food_chunkspack_chunks_egg": "chunks-packaged",
  "drink_alc_chunkspack_chunks_wine": "chunks-packaged",
  "food_chunkspack_chunks_pumpkinpie": "chunks-packaged",
  "food_chunkspack_chunks_potato": "chunks-packaged",
  "drink_nonalc_chunkspack_chunks_cola": "chunks-packaged",
  "food_chunkspack_chunks_chocolate": "chunks-packaged",
  "food_chunkspack_chunks_chicken": "chunks-packaged",
  "food_chunkspack_chunks_cheesesteak": "chunks-packaged",
  "food_chunkspack_chunks_cheesecake": "chunks-packaged",
  "food_chunkspack_chunks_beef": "chunks-packaged",
  "food_chunkspack_chunks_apple": "chunks-packaged",
  "sffl_se01_food": "food-bowl",
  "noclutter_food_exclmenuitem_pitstop_bartschili": "food-bowl",
  "food_served_tavern_friedpickles": "fried-pickles",
  "sfbgs001_food_craft_groatpie": "groat-pie",
  "sfbgs001_food_meat_groat": "groat-meat",
  "sfbgs001_food_chunkspack_chunks_groatchunks": "chunks-packaged",
  "drink_nonalc_drinkpouch_generic_sparklingwater": "fullfood-pouch",
  "food_packets_foodpouch": "fullfood-pouch",
  "aid_heartplus": "heart-plus",
  "aid_addichrone": "heart-plus",
  "chem_cqbx": "pill-bottle",
  "chem_hippolyta": "pill-bottle",
  "chem_craft_whiteout": "squall",
  "chem_squall": "squall",
  "food_craft_galaxymein": "takeout-container",
  "food_craft_clustermarsala": "takeout-container",
  "food_craft_nebulawat": "takeout-container",
  "food_generic_sweetrolls": "takeout-container",
  "food_craft_kidstufftraitmeatloaf": "takeout-container",
  "cf05_food_sandwich": "takeout-container",
  "food_craft_latkes": "takeout-container",
  "food_served_generic_sandwich01": "sandwich",
  "food_craft_barbacoawrap": "takeout-container",
  "food_craft_reubensand": "takeout-container",
  "food_craft_madraslentils": "takeout-container",
  "food_craft_bolognese": "takeout-container",
  "food_craft_carbonara": "takeout-container",
  "food_craft_dorowat": "takeout-container",
  "food_craft_chickentikka": "takeout-container",
  "food_craft_meatloaf": "takeout-container",
  "food_craft_chickenmarsala": "takeout-container",
  "food_craft_grilledcheesesand": "takeout-container",
  "food_craft_xenowurst": "takeout-container",
  "food_craft_crispynuggets": "takeout-container",
  "food_craft_aliensandwich": "takeout-container",
  "food_craft_alienpie": "takeout-container",
  "food_craft_alienstirfry": "takeout-container",
  "food_craft_alienscramble": "takeout-container",
  "food_craft_alienstew": "takeout-container",
  "food_craft_hamcheesesand": "takeout-container",
  "food_craft_chapaguri": "takeout-container",
  "sfbgs001_food_craft_seaweedeggporridge": "porridge",
  "food_packets_smokedfillet": "smoked-fillet",
  "food_carrykit_superfoodpasteset": "superfood-paste",
  "food_butchersbest_turkey": "synthameat",
  "food_butchersbest_chicken": "synthameat"
};

const VIEW_PRESETS: Record<string, PreviewOrientation> = {
  "medical-pouch": {
    "yawOffset": 0,
    "yaw": 0,
    "pitch": 0,
    "modelPitch": -1.5707963267948966
  },
  "kiffles": {
    "yawOffset": 0,
    "yaw": -0.9,
    "pitch": 0.5
  },
  "meal-kit": {
    "yawOffset": 0,
    "yaw": 1.88,
    "pitch": 0.58
  },
  "meal-pack": {
    "yawOffset": 0,
    "yaw": 0,
    "pitch": 0.9
  },
  "meal-tray": {
    "yawOffset": 0,
    "yaw": 0,
    "pitch": 0.72
  },
  "midnight": {
    "yawOffset": 0,
    "yaw": 1.82,
    "pitch": 0.5
  },
  "inhaler": {
    "yawOffset": 0,
    "yaw": 2.8,
    "pitch": 0.12
  },
  "patty-melt": {
    "yawOffset": 0,
    "yaw": -0.3,
    "pitch": 0.45
  },
  "pierogis": {
    "yawOffset": 0,
    "yaw": -0.65,
    "pitch": 0.5
  },
  "naan": {
    "yawOffset": 0,
    "yaw": -0.9,
    "pitch": 0.55
  },
  "alien-jerky": {
    "yawOffset": 0,
    "yaw": 5.65,
    "pitch": 0.62
  },
  "bitten-sandwich": {
    "yawOffset": 0,
    "yaw": 3.14,
    "pitch": 0.52
  },
  "edmontonian": {
    "yawOffset": 0,
    "yaw": 5.3,
    "pitch": 0.52
  },
  "haligonian": {
    "yawOffset": 0,
    "yaw": 5.35,
    "pitch": 0.52
  },
  "ham-boys": {
    "yawOffset": 0,
    "yaw": 5.2,
    "pitch": 0.52
  },
  "shepherds-pie": {
    "yawOffset": 0,
    "yaw": 5.58,
    "pitch": 0.48
  },
  "wine-bottle": {
    "yawOffset": 0,
    "yaw": 1.57,
    "pitch": 0.06
  },
  "chunks-packaged": {
    "yawOffset": 0,
    "yaw": 2.65,
    "pitch": 0.88
  },
  "food-bowl": {
    "yawOffset": 0,
    "yaw": 0,
    "pitch": 0.37
  },
  "fried-pickles": {
    "yawOffset": 0,
    "yaw": 5.27,
    "pitch": 0.53
  },
  "fullfood-pouch": {
    "yawOffset": 0,
    "yaw": 0,
    "pitch": 0.01,
    "modelPitch": 1.5707963267948966
  },
  "groat-meat": {
    "yawOffset": 0,
    "yaw": 0.6,
    "pitch": 0.91
  },
  "groat-pie": {
    "yawOffset": 0,
    "yaw": 2.61,
    "pitch": 0.48
  },
  "heart-plus": {
    "yawOffset": 0,
    "yaw": 2.49,
    "pitch": 0.61
  },
  "pill-bottle": {
    "yawOffset": 0,
    "yaw": 3.141592653589793,
    "pitch": 0.02
  },
  "takeout-container": {
    "yawOffset": 0,
    "yaw": 5.23,
    "pitch": 0.69
  },
  "sandwich": {
    "yawOffset": 0,
    "yaw": 5.46,
    "pitch": 0.49
  },
  "porridge": {
    "yawOffset": 0,
    "yaw": 0,
    "pitch": 0.47
  },
  "smoked-fillet": {
    "yawOffset": 0,
    "yaw": 3.57,
    "pitch": 0.8
  },
  "squall": {
    "yawOffset": 0,
    "yaw": 5.47,
    "pitch": 0.67
  },
  "superfood-paste": {
    "yawOffset": 0,
    "yaw": 2.62,
    "pitch": 0.17
  },
  "synthameat": {
    "yawOffset": 0,
    "yaw": 0,
    "pitch": 0.02,
    "modelPitch": 1.5707963267948966
  }
};

export function assetPreviewOrientation(type: string, editorId: string, modelPath?: string): PreviewOrientation | undefined {
  let view: string | undefined;
  if (modelPath !== undefined) {
    const path = modelPath.replaceAll('\\', '/').toLowerCase().replace(/^meshes\//, '');
    view = MODEL_VIEWS[path];
  } else if (['ALCH', 'MISC'].includes(type.toUpperCase())) {
    view = EDITOR_VIEWS[editorId.toLowerCase()];
  }
  return view ? VIEW_PRESETS[view] : undefined;
}
