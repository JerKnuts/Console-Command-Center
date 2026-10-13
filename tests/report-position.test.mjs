import test from 'node:test';
import assert from 'node:assert/strict';
import { rerenderKeepingPosition } from '../src/views/console.command-center/main/preserve-report-position.ts';
test('report rerender keeps list/detail positions and returns focus without scrolling',()=>{
 let elements={'#id-browser-results':[{scrollTop:2419,scrollLeft:0}],'.id-browser-selection-copy':[{scrollTop:94,scrollLeft:0}]};
 let focusOptions;
 const report='same-record';
 globalThis.document={activeElement:{dataset:{devRecord:report}},querySelectorAll:selector=>selector==='[data-dev-record]'?[{dataset:{devRecord:report},focus:options=>focusOptions=options}]:elements[selector]??[]};
 rerenderKeepingPosition(()=>{elements={'#id-browser-results':[{scrollTop:0,scrollLeft:0}],'.id-browser-selection-copy':[{scrollTop:0,scrollLeft:0}]};});
 assert.equal(elements['#id-browser-results'][0].scrollTop,2419);
 assert.equal(elements['.id-browser-selection-copy'][0].scrollTop,94);
 assert.deepEqual(focusOptions,{preventScroll:true});
 delete globalThis.document;
});
