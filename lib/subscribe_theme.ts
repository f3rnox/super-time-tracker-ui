type ThemeListener = () => void;

const theme_listeners = new Set<ThemeListener>();

/**
 * Subscribes to theme changes for useSyncExternalStore.
 */
export function subscribe_theme(listener: ThemeListener): () => void {
  theme_listeners.add(listener);

  return () => {
    theme_listeners.delete(listener);
  };
}

/**
 * Notifies all theme subscribers after the DOM theme changes.
 */
export function notify_theme_subscribers(): void {
  theme_listeners.forEach((listener) => {
    listener();
  });
}
