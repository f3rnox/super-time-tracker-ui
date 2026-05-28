"use client";

import { useSyncExternalStore } from "react";

import {
  get_entry_templates_server_snapshot,
  get_entry_templates_snapshot,
} from "@/lib/get_entry_templates_snapshot";
import { subscribe_entry_templates } from "@/lib/subscribe_entry_templates";
import { type EntryTemplate } from "@/lib/types/entry_template";

/**
 * Subscribes to check-in entry templates stored in local storage.
 */
export function use_entry_templates(): readonly EntryTemplate[] {
  return useSyncExternalStore(
    subscribe_entry_templates,
    get_entry_templates_snapshot,
    get_entry_templates_server_snapshot,
  );
}
