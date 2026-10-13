import type { IdCatalogEntry } from './id-catalog';

// Reviewed directly against the official small-master records installed with
// Starfield. Physical FURN records can be tested with player.placeatme. Their
// GBFM module records are included for Creation Kit/xEdit inspection and do
// not receive a console quick action.
export const REVIEWED_VEHICLE_CATALOG: IdCatalogEntry[] = [
  {
    label: 'REV-8',
    value: 'FE000033',
    type: 'FURN',
    category: 'Vehicles',
    detail: 'Physical vehicle form from SFBGS004.esm. Experimental spawning can create an unregistered vehicle; use a disposable save.',
    keywords: ['Rev8', 'rover', 'land vehicle', 'SFBGS004'],
    action: 'spawn',
    plugin: 'SFBGS004.esm',
    pluginKind: 'small',
    localFormId: '033',
    editorId: 'Rev8',
    source: 'Base Game',
  },
  {
    label: 'REV-8 Vehicle Module',
    value: 'FE000046',
    type: 'GBFM',
    category: 'Vehicles',
    detail: 'Vehicle module base form from SFBGS004.esm for Creation Kit/xEdit inspection and tuning. This is not the physical spawn form.',
    keywords: ['REV8', 'vehicle module', 'SFBGS004'],
    plugin: 'SFBGS004.esm',
    pluginKind: 'small',
    localFormId: '046',
    editorId: 'SMS_Vehicle_Nova_REV8_Top',
    source: 'Base Game',
  },
  {
    label: 'Moonjumper',
    value: 'FE001001',
    type: 'FURN',
    category: 'Vehicles',
    detail: 'Physical vehicle form from the Moonjumper module SFBGS047.esm supplied with Free Lanes. Experimental spawning can create an unregistered vehicle; use a disposable save.',
    keywords: ['MoonJumper', 'rover', 'land vehicle', 'Free Lanes', 'SFBGS047'],
    action: 'spawn',
    plugin: 'SFBGS047.esm',
    pluginKind: 'small',
    localFormId: '001',
    editorId: 'MoonJumper',
    source: 'Free Lanes',
  },
  {
    label: 'Moonjumper Vehicle Module',
    value: 'FE001018',
    type: 'GBFM',
    category: 'Vehicles',
    detail: 'Vehicle module base form from Free Lanes for Creation Kit/xEdit inspection and tuning. This is not the physical spawn form.',
    keywords: ['MoonJumper', 'vehicle module', 'Free Lanes', 'SFBGS047'],
    plugin: 'SFBGS047.esm',
    pluginKind: 'small',
    localFormId: '018',
    editorId: 'SFBGS047_SMS_Vehicle_MoonJumper',
    source: 'Free Lanes',
  },
];
