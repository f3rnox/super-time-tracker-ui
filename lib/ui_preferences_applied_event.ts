export const UI_PREFERENCES_APPLIED_EVENT = "stt-ui-preferences-applied";

/**
 * Notifies listeners that UI preferences were written to localStorage.
 */
export function dispatch_ui_preferences_applied_event(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(UI_PREFERENCES_APPLIED_EVENT));
}
