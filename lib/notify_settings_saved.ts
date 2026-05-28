type SettingsSavedListener = (message: string) => void;

const listeners = new Set<SettingsSavedListener>();

export const SETTINGS_SAVED_DEFAULT_MESSAGE = "Settings saved";

let debounce_timer: ReturnType<typeof setTimeout> | null = null;
let pending_message = SETTINGS_SAVED_DEFAULT_MESSAGE;

/**
 * Subscribes to settings-saved toast events.
 */
export function subscribe_settings_saved(
  listener: SettingsSavedListener,
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Queues a short debounced “settings saved” toast (settings UI only).
 */
export function notify_settings_saved(
  message: string = SETTINGS_SAVED_DEFAULT_MESSAGE,
): void {
  if (typeof window === "undefined") {
    return;
  }

  pending_message = message;

  if (debounce_timer !== null) {
    clearTimeout(debounce_timer);
  }

  debounce_timer = setTimeout(() => {
    debounce_timer = null;
    const next_message = pending_message;

    listeners.forEach((listener) => {
      listener(next_message);
    });
  }, 200);
}
