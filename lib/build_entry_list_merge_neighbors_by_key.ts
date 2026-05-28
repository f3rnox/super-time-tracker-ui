import { get_entry_row_key } from "@/lib/get_entry_row_key";
import { get_mergeable_entry_neighbors } from "@/lib/get_mergeable_entry_neighbors";
import { type SerializedEntry } from "@/lib/types/tracker_state";

/**
 * Maps each visible entry row to mergeable neighbors within a sheet entry list.
 */
export function build_entry_list_merge_neighbors_by_key(
  entries: SerializedEntry[],
  merge_context_entries: SerializedEntry[] | undefined,
): Map<string, ReturnType<typeof get_mergeable_entry_neighbors>> {
  const merge_source = merge_context_entries ?? entries;
  const map = new Map<
    string,
    ReturnType<typeof get_mergeable_entry_neighbors>
  >();

  for (const entry of entries) {
    const key = get_entry_row_key(entry);
    map.set(key, get_mergeable_entry_neighbors(entry, merge_source));
  }

  return map;
}
