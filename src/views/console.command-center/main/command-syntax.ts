export type CommandToken = { text: string; kind: 'plain' | 'command' | 'target' | 'id' | 'number' | 'string' | 'keyword' | 'comment' };

// Console comments end at the newline, except inside double-quoted arguments.
// Keep the original text intact so highlighting never rewrites a user's draft.
export function tokenizeCommandLine(line: string): CommandToken[] {
  const tokens: CommandToken[] = [];
  const add = (text: string, kind: CommandToken['kind']) => { if (text) tokens.push({ text, kind }); };
  let position = 0, first = true;
  while (position < line.length) {
    const rest = line.slice(position), ch = line[position];
    const whitespace = rest.match(/^\s+/);
    if (whitespace) { add(whitespace[0], 'plain'); position += whitespace[0].length; continue; }
    if (ch === '#' || ch === ';') { add(rest, 'comment'); break; }
    if (ch === '"') {
      let end = position + 1;
      while (end < line.length) {
        if (line[end] === '\\' && end + 1 < line.length) { end += 2; continue; }
        if (line[end++] === '"') break;
      }
      add(line.slice(position, end), 'string'); position = end; first = false; continue;
    }
    const word = rest.match(/^[^\s"#;]+/)![0];
    if (first) {
      const qualified = word.match(/^([a-z_][\w]*|[\da-f]{6,8})(\.)([a-z_][\w]*)$/i);
      if (qualified) { add(qualified[1], 'target'); add('.', 'plain'); add(qualified[3], 'command'); }
      else add(word, 'command');
    } else if (/^(?:to|true|false)$/i.test(word)) add(word, 'keyword');
    else if (/^(?:0x[\da-f]+|[\da-f]{8}|(?=[\da-f]{6,7}$)(?=.*[a-f])[\da-f]+)$/i.test(word)) add(word, 'id');
    else if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(word)) add(word, 'number');
    else add(word, 'plain');
    position += word.length; first = false;
  }
  return tokens;
}

export function parseBatchCommands(content: string): string[] {
  return content.replace(/^\uFEFF/, '').split(/\r?\n/).map(line =>
    tokenizeCommandLine(line).filter(token => token.kind !== 'comment').map(token => token.text).join('').trim(),
  ).filter(Boolean);
}

const escapeText = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function highlightCommands(content: string): string {
  return content.split(/\r?\n/).map(line => '<span class="command-source-line">' + (tokenizeCommandLine(line).map(token =>
    token.kind === 'plain' ? escapeText(token.text) : `<span class="command-syntax-${token.kind}">${escapeText(token.text)}</span>`,
  ).join('') || '<br>') + '</span>').join('');
}

export function updateCommandHighlight(input: HTMLTextAreaElement): void {
  const mirror = input.closest('.custom-command-editor')?.querySelector<HTMLElement>('.custom-command-highlight-content');
  if (!mirror) return;
  mirror.classList.toggle('is-placeholder', !input.value);
  mirror.innerHTML = highlightCommands(input.value || input.placeholder);
  syncCommandHighlight(input);
}

export function syncCommandHighlight(input: HTMLTextAreaElement): void {
  const host = input.closest('.custom-command-editor');
  const mirror = host?.querySelector<HTMLElement>('.custom-command-highlight-content');
  const clip = host?.querySelector<HTMLElement>('.custom-command-highlight');
  if (mirror) mirror.style.transform = `translate(${-input.scrollLeft}px, ${-input.scrollTop}px)`;
  // Clip to the editable viewport rather than painting beneath its scrollbars.
  if (clip) { clip.style.width = `${input.clientWidth}px`; clip.style.height = `${input.clientHeight}px`; }
  // Each gutter number occupies the full visual height of its logical source line.
  // Soft wrapping never inserts new command separators into the textarea value.
  if (mirror) {
    mirror.style.width = `${input.clientWidth}px`;
    const lines = mirror.querySelectorAll?.<HTMLElement>('.command-source-line');
    const numbers = host?.querySelectorAll?.<HTMLElement>('.custom-command-line-number');
    if (lines && numbers) numbers.forEach((number,index) => {
      const line = lines[index];
      if (line) number.style.height = `${line.getBoundingClientRect().height}px`;
    });
  }
  host?.classList?.toggle('has-command-highlighting', Boolean(mirror?.textContent && input.clientWidth > 0 && input.clientHeight > 0));
}
