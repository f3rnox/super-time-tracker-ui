/**
 * Runs work after the browser is idle, or after a short timeout when idle is unavailable.
 */
export function schedule_when_idle(task: () => void): void {
  if (typeof globalThis.requestIdleCallback === "function") {
    globalThis.requestIdleCallback(() => {
      task();
    });
    return;
  }

  globalThis.setTimeout(task, 1);
}
