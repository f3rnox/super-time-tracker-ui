"use client";

import { useSyncExternalStore } from "react";

import { desktop_notifications_preference } from "@/lib/preferences/desktop_notifications_preference";

/**
 * Subscribes to the desktop-notifications preference.
 */
export function useDesktopNotifications(): boolean {
  const value = useSyncExternalStore(
    desktop_notifications_preference.subscribe,
    desktop_notifications_preference.get_snapshot,
    desktop_notifications_preference.get_server_snapshot,
  );

  return value === "true";
}
