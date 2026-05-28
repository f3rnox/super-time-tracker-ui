import { collect_known_tags } from "@/lib/collect_known_tags";
import { filter_visible_entries } from "@/lib/filter_visible_entries";
import { is_sheet_archived } from "@/lib/is_sheet_archived";
import { resolve_db_path_label } from "@/lib/resolve_db_path_label";
import { get_focus_nudges_status } from "@/lib/get_focus_nudges_status";
import { get_sheet } from "@/lib/get_sheet";
import { get_serialized_entries_total_ms } from "@/lib/get_serialized_entries_total_ms";
import { read_db } from "@/lib/read_db";
import { resolve_active_sheet_name } from "@/lib/resolve_active_sheet_name";
import { find_all_serialized_active_entries } from "@/lib/find_all_serialized_active_entries";
import { find_running_entry_on_sheet } from "@/lib/find_running_entry_on_sheet";
import { find_serialized_active_entry_for_sheet } from "@/lib/find_serialized_active_entry_for_sheet";
import { serialize_sheet_entries } from "@/lib/serialize_sheet_entries";
import { set_active_sheet } from "@/lib/set_active_sheet";
import { sort_serialized_entries } from "@/lib/sort_serialized_entries";
import { type GetTrackerStateOptions } from "@/lib/types/get_tracker_state_options";
import {
  type SerializedEntry,
  type TrackerState,
} from "@/lib/types/tracker_state";

/**
 * Builds the tracker snapshot consumed by the web UI.
 */
export async function get_tracker_state(
  preferred_sheet_name?: string | null,
  options: GetTrackerStateOptions = {},
): Promise<TrackerState> {
  const persist_active_sheet = options.persist_active_sheet ?? true;
  const include_sheet_entries = options.include_sheet_entries ?? true;
  const include_focus_nudges = options.include_focus_nudges ?? false;

  const db = options.db ?? (await read_db());
  const resolved_sheet_name = resolve_active_sheet_name(
    db,
    preferred_sheet_name,
  );

  if (persist_active_sheet && db.activeSheetName !== resolved_sheet_name) {
    await set_active_sheet(resolved_sheet_name);
    db.activeSheetName = resolved_sheet_name;
  }

  const { sheets } = db;

  let active_sheet_entries: SerializedEntry[] = [];

  if (include_sheet_entries) {
    const sheet = get_sheet(db, resolved_sheet_name);

    active_sheet_entries = sort_serialized_entries(
      serialize_sheet_entries(sheet),
      "newest",
    );
  }

  const active_sheet_entry = find_serialized_active_entry_for_sheet(
    db,
    resolved_sheet_name,
  );
  const running_entries = find_all_serialized_active_entries(db);
  const running_entry = active_sheet_entry ?? running_entries[0] ?? null;

  const focus_nudges_status_global = include_focus_nudges
    ? await get_focus_nudges_status({ scope: "global", db })
    : undefined;

  return {
    dbPath: await resolve_db_path_label(),
    activeSheetName: resolved_sheet_name,
    knownTags: collect_known_tags(db),
    sheets: sheets.map((sheet) => ({
      name: sheet.name,
      activeEntryID: sheet.activeEntryID,
      entryCount: filter_visible_entries(sheet.entries).length,
      isActive: sheet.name === resolved_sheet_name,
      hasActiveEntry: find_running_entry_on_sheet(sheet) !== null,
      ...(is_sheet_archived(sheet) ? { archived: true } : {}),
    })),
    activeEntry: active_sheet_entry,
    runningEntry: running_entry,
    runningEntries: running_entries,
    activeSheetEntries: active_sheet_entries,
    activeSheetTotalMs: get_serialized_entries_total_ms(active_sheet_entries),
    activeSheetEntriesLoaded: include_sheet_entries,
    focusNudgesStatusGlobal: focus_nudges_status_global,
  };
}
