// A report changes the tested marker, not the user's browsing position.
export function rerenderKeepingPosition(render: () => void): void {
  const selectors = ['#id-browser-results', '.quest-browser-list', '#command-list', '.compact-command-list', '.id-browser-selection-copy', '.navigation-categories'];
  const positions = selectors.flatMap(selector => Array.from(document.querySelectorAll<HTMLElement>(selector), (element, index) => ({ selector, index, top: element.scrollTop, left: element.scrollLeft })));
  const active = document.activeElement as HTMLElement | null;
  const report = active?.dataset.devRecord;
  const action=active?.dataset.devAction;
  render();
  if (report) Array.from(document.querySelectorAll<HTMLButtonElement>('[data-dev-record]')).find(button => button.dataset.devRecord === report&&(!action||button.dataset.devAction===action))?.focus({ preventScroll: true });
  for (const position of positions) {
    const element = document.querySelectorAll<HTMLElement>(position.selector)[position.index];
    if (element) { element.scrollTop = position.top; element.scrollLeft = position.left; }
  }
}
