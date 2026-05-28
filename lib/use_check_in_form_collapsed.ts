"use client";

import { useSyncExternalStore } from "react";

import { check_in_form_collapsed_preference } from "@/lib/preferences/check_in_form_collapsed_preference";

/**
 * Subscribes to the "collapse check-in form" preference (boolean).
 */
export function use_check_in_form_collapsed(): boolean {
  const value = useSyncExternalStore(
    check_in_form_collapsed_preference.subscribe,
    check_in_form_collapsed_preference.get_snapshot,
    check_in_form_collapsed_preference.get_server_snapshot,
  );

  return value === "true";
}
