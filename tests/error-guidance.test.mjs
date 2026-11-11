import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
import {errorReportGuidance} from '../src/views/console.command-center/main/error-guidance.ts';

test('failure notices retain the error and request a diagnostic log without duplicate guidance',()=>{
  const source=readFileSync(new URL('../src/views/console.command-center/main/main.ts',import.meta.url),'utf8');
  const fn=source.match(/^function setStatus\b[\s\S]*?^}/m)[0];
  const status={dataset:{},setAttribute(){},prepend(){}};
  const c=vm.createContext({status,errorReportGuidance,recordDiagnostic(){},createLoadingRing:()=>({})});
  vm.runInContext(stripTypeScriptTypes(fn),c);
  c.setStatus('query-timeout: No result was captured.','error');
  assert.match(status.textContent,/^query-timeout: No result was captured\./);
  assert.match(status.textContent,/report this error to the mod author and include your diagnostic log/);
  assert.ok(status.textContent.includes('Documents\\My Games\\Starfield\\SFSE\\Logs\\Console Command Center.log'));
  assert.ok(!status.textContent.includes('Export Reports'));
  assert.ok(status.textContent.includes('No export is needed'));
  c.setStatus(status.textContent,'error');
  assert.equal(status.textContent.match(/Please report/g).length,1);
  for(const kind of ['normal','working','success']){
    c.setStatus('Original notice',kind);assert.equal(status.textContent,'Original notice');
  }
});
