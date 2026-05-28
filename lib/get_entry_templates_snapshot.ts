import {
  EMPTY_ENTRY_TEMPLATES,
  get_stable_entry_templates_snapshot,
} from "@/lib/entry_templates_snapshots";
import { read_entry_templates } from "@/lib/read_entry_templates";
import { type EntryTemplate } from "@/lib/types/entry_template";

/**
 * Returns entry templates from local storage for useSyncExternalStore (client).
 */
export function get_entry_templates_snapshot(): readonly EntryTemplate[] {
  return get_stable_entry_templates_snapshot(read_entry_templates());
}

/**
 * Returns the entry templates snapshot used during server rendering.
 */
export function get_entry_templates_server_snapshot(): readonly EntryTemplate[] {
  return EMPTY_ENTRY_TEMPLATES;
}
