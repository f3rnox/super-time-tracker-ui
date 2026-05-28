/**
 * Returns whether the browser supports the Notification API.
 */
export function is_browser_notification_available(): boolean {
  return globalThis.window !== undefined && "Notification" in globalThis.window;
}
