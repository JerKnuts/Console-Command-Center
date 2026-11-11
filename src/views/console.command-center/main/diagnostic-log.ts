type Request = (name: string, payload: Record<string, string>, options: {timeoutMs: number}) => Promise<unknown>;

// Best effort only: diagnostic failures must never trigger another error or
// prevent an item action. Deduplicate repeats and bound traffic per UI session.
export function createDiagnosticLog(request: Request, version: string) {
  const sent = new Set<string>();
  return (event: string, detail: string): void => {
    const bounded = detail.slice(0, 2048);
    const key = `${event}:${bounded}`;
    if (sent.has(key) || sent.size >= 100) return;
    sent.add(key);
    try {
      void request('console.command-center.diagnostic', {event: event.slice(0, 64), uiVersion: version.slice(0, 32), detail: bounded}, {timeoutMs: 2000}).catch(() => {});
    } catch { /* The bridge itself may be unavailable. */ }
  };
}
