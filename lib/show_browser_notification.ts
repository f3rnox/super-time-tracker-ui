/**
 * Shows a desktop notification when permission is granted.
 */
export function show_browser_notification(title: string, body: string): void {
  if (globalThis.window === undefined) {
    return;
  }

  if (globalThis.window.Notification.permission !== "granted") {
    return;
  }

  const notification = new globalThis.window.Notification(title, { body });
  notification.onclose = null;
}
