// Retry only the read-only handshake. Never replay a command or reset a browser.
export function createNativeReconnect(attempt: () => Promise<boolean>, timers = {
  set: (callback: () => void, delay: number) => setTimeout(callback, delay),
  clear: (timer: ReturnType<typeof setTimeout>) => clearTimeout(timer),
}) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running = false;
  let stopped = false;
  let delay = 5000;
  const retry = async () => {
    if (running || stopped) return;
    if (timer !== undefined) timers.clear(timer);
    timer = undefined;
    running = true;
    let complete = false;
    try { complete = await attempt(); }
    catch { complete = false; }
    finally {
      running = false;
      if (complete) stopped = true;
      if (!stopped && !complete) {
        timer = timers.set(() => { void retry(); }, delay);
        delay = Math.min(delay * 2, 30000);
      }
    }
  };
  return {
    retry,
    stop() { stopped = true; if (timer !== undefined) timers.clear(timer); timer = undefined; },
  };
}
