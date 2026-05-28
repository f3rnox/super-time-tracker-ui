import { reset_sheet_tag_filter_snapshot_cache } from "@/lib/sheet_tag_filter_snapshots";

type SheetTagFiltersListener = () => void;

const sheet_tag_filters_listeners = new Set<SheetTagFiltersListener>();

/**
 * Subscribes to sheet tag filter changes for useSyncExternalStore.
 */
export function subscribe_sheet_tag_filters(
  listener: SheetTagFiltersListener,
): () => void {
  sheet_tag_filters_listeners.add(listener);

  return () => {
    sheet_tag_filters_listeners.delete(listener);
  };
}

/**
 * Notifies subscribers after sheet tag filters change.
 */
export function notify_sheet_tag_filters_subscribers(): void {
  reset_sheet_tag_filter_snapshot_cache();
  sheet_tag_filters_listeners.forEach((listener) => {
    listener();
  });
}
