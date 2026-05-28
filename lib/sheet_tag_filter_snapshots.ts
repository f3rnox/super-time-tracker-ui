/**
 * Stable empty tag filter list for useSyncExternalStore snapshots.
 */
export const EMPTY_SHEET_TAG_FILTER: readonly string[] = [];

interface SheetTagFilterSnapshotCache {
  sheet_name: string;
  tags_key: string;
  snapshot: readonly string[];
}

let snapshot_cache: SheetTagFilterSnapshotCache | null = null;

/**
 * Clears the cached sheet tag filter snapshot.
 */
export function reset_sheet_tag_filter_snapshot_cache(): void {
  snapshot_cache = null;
}

/**
 * Returns a stable snapshot reference for the given tag list.
 */
export function get_stable_sheet_tag_filter_snapshot(
  sheet_name: string,
  tags: string[],
): readonly string[] {
  const tags_key = tags.join("\0");

  if (
    snapshot_cache !== null &&
    snapshot_cache.sheet_name === sheet_name &&
    snapshot_cache.tags_key === tags_key
  ) {
    return snapshot_cache.snapshot;
  }

  const snapshot =
    tags.length === 0 ? EMPTY_SHEET_TAG_FILTER : Object.freeze([...tags]);

  snapshot_cache = {
    sheet_name,
    tags_key,
    snapshot,
  };

  return snapshot;
}
