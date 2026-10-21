import { cccTranslationsPlugin } from '../../../../scripts/translations-preview.mjs';
export default {plugins:[cccTranslationsPlugin(decodeURIComponent(new URL('../../../../',import.meta.url).pathname).replace(/^\/(\w:)/,'$1'))]};
