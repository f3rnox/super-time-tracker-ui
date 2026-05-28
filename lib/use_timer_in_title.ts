"use client";

import { useSyncExternalStore } from "react";

import { timer_in_title_preference } from "@/lib/preferences/timer_in_title_preference";

/**
 * Subscribes to the timer-in-document-title preference.
 */
export function use_timer_in_title(): boolean {
  const value = useSyncExternalStore(
    timer_in_title_preference.subscribe,
    timer_in_title_preference.get_snapshot,
    timer_in_title_preference.get_server_snapshot,
  );

  return value === "true";
}
