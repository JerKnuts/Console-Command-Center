export type DevFeedbackRecord = { kind: string; name: string; id?: string; localId?: string; source?: string; category?: string; command?: string };
export type DevFeedbackReport = DevFeedbackRecord & { version: string; time: string; status: string; comment: string };
let enabled = false;
const STORAGE_KEY = 'ccc.dev-feedback.v1';
const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll("'", '&#39;');

export function devFeedbackResults(kind: string): string[] {
  return ['Working', 'Not working', 'Not noticeable',
    ...(kind === 'ID' ? ['Reference Only'] : []),
    ...(kind === 'Command' ? ['Executed (no effect)'] : [])];
}

export function devFeedbackButton(record: DevFeedbackRecord): string {
  return enabled ? `<button class="osf-btn osf-btn--sm dev-feedback-button" type="button" data-dev-record="${escape(JSON.stringify(record))}">Test Report</button>` : '';
}

export function formatDevFeedback(reports: DevFeedbackReport[]): string {
  return 'Console Command Center — Test Feedback\r\n\r\n' + reports.map((r, index) => [
    `Report ${index + 1}`, `Time: ${r.time}`, `CCC: ${r.version}`, `Kind: ${r.kind}`, `Name: ${r.name}`,
    ...(r.id ? [`ID: ${r.id}`] : []), ...(r.localId ? [`Local ID: ${r.localId}`] : []),
    ...(r.source ? [`Source: ${r.source}`] : []), ...(r.category ? [`Category: ${r.category}`] : []),
    ...(r.command ? [`Command: ${r.command}`] : []), `Result: ${r.status || 'Comment only'}`,
    ...(r.status === 'Reference Only' ? ['Observation: Nothing appeared in the player inventory.', 'Requested change: Remove Add to Player, mark Reference Only, and sort below normal items.'] : []),
    ...(r.status === 'Executed (no effect)' ? ['Observation: The command executed, but no effect was observed.'] : []),
    'Comment:', r.comment || '(none)', '----------------------------------------', '',
  ].join('\r\n')).join('\r\n');
}

export function installDevFeedback(options: { version: string; rerender: () => void; status: (text: string, error?: boolean) => void; exportText: (text: string) => Promise<string> }): void {
  const dot = document.querySelector<HTMLButtonElement>('#dev-mode-dot');
  const exportButton = document.querySelector<HTMLButtonElement>('#dev-feedback-export');
  let reports: DevFeedbackReport[] = [];
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (Array.isArray(saved)) reports = saved.filter(r => r && typeof r.name === 'string' && typeof r.kind === 'string' && typeof r.comment === 'string' && typeof r.status === 'string' && typeof r.time === 'string' && typeof r.version === 'string');
  } catch { options.status('Saved test reports could not be read.', true); }
  let clicks = 0;
  dot?.addEventListener('click', () => {
    if (++clicks < 5) return;
    clicks = 0;
    enabled = !enabled;
    dot.classList.toggle('is-active', enabled);
    dot.setAttribute('aria-pressed', String(enabled));
    if (exportButton) exportButton.hidden = !enabled;
    options.rerender();
    options.status(`Dev Mode ${enabled ? 'enabled. Select Test Report on an entry; Export Reports saves all notes.' : 'disabled. Saved reports are kept.'}`);
  });
  exportButton?.addEventListener('click', async () => {
    if (!reports.length) { options.status('No test reports to export.'); return; }
    exportButton.disabled = true;
    try { options.status(`Exported ${reports.length} test reports to ${await options.exportText(formatDevFeedback(reports))}`); }
    catch (error) { options.status(`Report export failed: ${error instanceof Error ? error.message : String(error)}. Your reports are still saved.`, true); }
    finally { exportButton.disabled = false; }
  });
  document.addEventListener('click', (event) => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-dev-record]');
    if (!button || !enabled || document.querySelector('dialog.dev-feedback-dialog[open]')) return;
    let record: DevFeedbackRecord;
    try { record = JSON.parse(button.dataset.devRecord!); } catch { return; }
    const dialog = document.createElement('dialog');
    dialog.className = 'dev-feedback-dialog osf-card';
    let selectedStatus = '';
    dialog.setAttribute('aria-label', 'Test report for ' + record.name);
    dialog.innerHTML = `<form method="dialog"><p class="osf-eyebrow">DEV MODE TEST REPORT</p><h3>${escape(record.name)}</h3><p>${escape(record.kind)}${record.id ? ' · ' + escape(record.id) : ''}</p><fieldset><legend>Result (optional)</legend>${devFeedbackResults(record.kind).map(value => `<button class="osf-btn osf-btn--sm" type="button" data-dev-result="${value}" aria-pressed="false">${value}</button>`).join('')}</fieldset>${record.kind === 'ID' ? '<p class="game-settings-reference-note">Reference Only: nothing appeared in inventory. Requests removal of Add to Player and a Reference Only label.</p>' : ''}<label class="dev-feedback-comment-label">Comment (optional)<textarea class="osf-input" name="comment" rows="5" maxlength="4000" aria-label="Test comment"></textarea></label><p class="dev-feedback-error" role="alert"></p><div class="dev-feedback-actions"><button class="osf-btn osf-btn--sm" type="button" data-cancel-report>Cancel</button><button class="osf-btn osf-btn--sm osf-btn--osf-accent" type="submit">Save Report</button></div></form>`;
    document.body.append(dialog);
    const resultButtons = dialog.querySelectorAll<HTMLButtonElement>('[data-dev-result]');
    resultButtons.forEach((resultButton) => resultButton.addEventListener('click', () => {
      selectedStatus = selectedStatus === resultButton.dataset.devResult ? '' : resultButton.dataset.devResult!;
      resultButtons.forEach((button) => {
        const active = button.dataset.devResult === selectedStatus;
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('osf-btn--osf-accent', active);
      });
    }));
    dialog.querySelector('[data-cancel-report]')?.addEventListener('click', () => dialog.close());
    dialog.querySelector('form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const status = selectedStatus;
      const comment = dialog.querySelector<HTMLTextAreaElement>('textarea')?.value.trim() ?? '';
      const error = dialog.querySelector<HTMLElement>('.dev-feedback-error')!;
      if (!status && !comment) { error.textContent = 'Select a result or enter a comment.'; return; }
      const next = [...reports, { ...record, status, comment, version: options.version, time: new Date().toISOString() }];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
      catch { error.textContent = 'The report could not be saved. Export existing reports or free browser storage and try again.'; return; }
      reports = next;
      dialog.close();
      options.status(`Saved test report for ${record.name}. ${reports.length} reports ready to export.`);
    });
    dialog.addEventListener('close', () => { dialog.remove(); if (button.isConnected) button.focus(); });
    dialog.showModal();
  });
}
