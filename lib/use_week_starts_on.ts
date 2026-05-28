"use client";

import { useSyncExternalStore } from "react";

import { week_starts_on_preference } from "@/lib/preferences/week_starts_on_preference";
import { type WeekStartsOn } from "@/lib/types/ui_preferences";

/**
 * Subscribes to the week-starts-on preference.
 */
export function use_week_starts_on(): WeekStartsOn {
  return useSyncExternalStore(
    week_starts_on_preference.subscribe,
    week_starts_on_preference.get_snapshot,
    week_starts_on_preference.get_server_snapshot,
  );
}
