"use client";

import { useSyncExternalStore } from "react";

import { entry_list_sort_preference } from "@/lib/preferences/entry_list_sort_preference";
import { type EntryListSort } from "@/lib/types/ui_preferences";

/**
 * Subscribes to the entry list sort preference.
 */
export function use_entry_list_sort(): EntryListSort {
  return useSyncExternalStore(
    entry_list_sort_preference.subscribe,
    entry_list_sort_preference.get_snapshot,
    entry_list_sort_preference.get_server_snapshot,
  );
}
