export type UiPreferences = { advanced: boolean; theme: 'dark' | 'light'; previewResolution: 'low' | 'medium' | 'high' | 'ultra' };
export function parseUiPreferences(value: unknown): UiPreferences {
  const data = value && typeof value === 'object' ? value as Partial<UiPreferences> : {};
  return { advanced: data.advanced === true, theme: data.theme === 'light' ? 'light' : 'dark', previewResolution: data.previewResolution === 'low' || data.previewResolution === 'medium' || data.previewResolution === 'ultra' ? data.previewResolution : 'high' };
}
const KEY = 'ccc.ui-preferences.v1';
function read(): UiPreferences {
  try { return parseUiPreferences(JSON.parse(localStorage.getItem(KEY) ?? '{}')); }
  catch { return parseUiPreferences(null); }
}
export const uiPreferences = read();
export function setPreviewResolution(quality:UiPreferences['previewResolution']): boolean {
  uiPreferences.previewResolution=quality;
  if(typeof document!=='undefined')document.querySelectorAll<HTMLButtonElement>('[data-preview-quality]').forEach(choice=>{const selected=choice.dataset.previewQuality===quality;choice.setAttribute('aria-pressed',String(selected));choice.classList.toggle('osf-btn--osf-accent',selected);});
  try{localStorage.setItem(KEY,JSON.stringify(uiPreferences));return true;}catch{return false;}
}

export function visibleIdCategory(category: string, advanced: boolean): boolean {
  return advanced || !['game-settings', 'locations', 'ship-parts'].includes(category);
}
export function visibleIdRecord(record: { type: string; category: string; referenceOnly?: boolean }, advanced: boolean): boolean {
  return advanced || (!record.referenceOnly && record.type.toUpperCase() !== 'LCTN' && record.category !== 'Locations' && record.category !== 'Ship Parts & Other Forms');
}
export function visibleQuestRecord(record: { category: string; internal: boolean }, advanced: boolean): boolean {
  return advanced || !(record.internal || record.category === 'Internal / System');
}
export function visibleCommandRecord(record: { category: string }, advanced: boolean): boolean {
  return advanced || !['Untested', 'Advanced Settings'].includes(record.category);
}

export function installUiSettings(options: { changed: () => void; status: (text: string, error?: boolean) => void }): void {
  document.documentElement.dataset.cccTheme = uiPreferences.theme;
  document.querySelector('#open-settings')?.addEventListener('click', () => {
    if (document.querySelector('dialog.ui-settings-dialog[open]')) return;
    const dialog = document.createElement('dialog');
    dialog.className = 'ui-settings-dialog osf-card';
    dialog.setAttribute('aria-label', 'Console Command Center Settings');
    dialog.innerHTML = `<div class="results-head"><h2>Settings</h2><button class="osf-btn osf-btn--sm" type="button" data-close-settings>Close</button></div><div class="ui-settings-option"><div><strong>Advanced Options</strong><p>Show record IDs and technical details, WIP commands, advanced settings, reference records and internal quests.</p></div><button class="osf-btn osf-btn--sm" type="button" data-toggle-advanced aria-pressed="${uiPreferences.advanced}">${uiPreferences.advanced ? 'On' : 'Off'}</button></div><div class="ui-settings-option"><div><strong>Appearance</strong><p>Switch between light and dark themes.</p></div><button class="osf-btn osf-btn--sm" type="button" data-toggle-theme aria-pressed="${uiPreferences.theme === 'light'}">${uiPreferences.theme === 'light' ? 'Light Mode' : 'Dark Mode'}</button></div>`;
    document.body.append(dialog);
    dialog.insertAdjacentHTML?.('beforeend', `<div class="ui-settings-option"><div><strong>Model Viewer Quality</strong><p>All presets include enhanced reflections, bloom and subtle grain. Higher quality uses sharper textures and higher resolution.</p></div><div class="ui-preview-quality" role="group" aria-label="Model Viewer Quality">${(['low','medium','high','ultra'] as const).map(quality => `<button class="osf-btn osf-btn--sm${quality === uiPreferences.previewResolution ? ' osf-btn--osf-accent' : ''}" type="button" data-preview-quality="${quality}" aria-pressed="${quality === uiPreferences.previewResolution}">${quality[0].toUpperCase()+quality.slice(1)}</button>`).join('')}</div></div>`);
    const persist = () => {
      try { localStorage.setItem(KEY, JSON.stringify(uiPreferences)); }
      catch { options.status('Settings changed for this session but could not be saved.', true); }
      document.documentElement.dataset.cccTheme = uiPreferences.theme;
      options.changed();
    };
    const advanced = dialog.querySelector<HTMLButtonElement>('[data-toggle-advanced]')!;
    const theme = dialog.querySelector<HTMLButtonElement>('[data-toggle-theme]')!;
    advanced.addEventListener('click', () => {
      uiPreferences.advanced = !uiPreferences.advanced;
      advanced.textContent = uiPreferences.advanced ? 'On' : 'Off';
      advanced.setAttribute('aria-pressed', String(uiPreferences.advanced));
      persist();
    });
    theme.addEventListener('click', () => {
      uiPreferences.theme = uiPreferences.theme === 'dark' ? 'light' : 'dark';
      theme.textContent = uiPreferences.theme === 'light' ? 'Light Mode' : 'Dark Mode';
      theme.setAttribute('aria-pressed', String(uiPreferences.theme === 'light'));
      persist();
    });
    dialog.querySelectorAll?.<HTMLButtonElement>('[data-preview-quality]').forEach(button => button.addEventListener('click', () => {
      const quality=button.dataset.previewQuality;if(quality!=='low'&&quality!=='medium'&&quality!=='high'&&quality!=='ultra')return;
      setPreviewResolution(quality);
      dialog.querySelectorAll<HTMLButtonElement>('[data-preview-quality]').forEach(choice=>{const selected=choice===button;choice.setAttribute('aria-pressed',String(selected));choice.classList.toggle('osf-btn--osf-accent',selected);});persist();
    }));
    dialog.querySelector('[data-close-settings]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { dialog.remove(); document.querySelector<HTMLButtonElement>('#open-settings')?.focus(); });
    dialog.showModal();
  });
}
