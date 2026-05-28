import { read_sheet_tag_filter } from "@/lib/read_sheet_tag_filter";
import {
  EMPTY_SHEET_TAG_FILTER,
  get_stable_sheet_tag_filter_snapshot,
} from "@/lib/sheet_tag_filter_snapshots";

/**
 * Returns the sheet tag filter snapshot from localStorage (client-only).
 */
export function get_sheet_tag_filter_snapshot(
  sheet_name: string,
): readonly string[] {
  return get_stable_sheet_tag_filter_snapshot(
    sheet_name,
    read_sheet_tag_filter(sheet_name),
  );
}

/**
 * Returns the sheet tag filter snapshot used during server rendering.
 */
export function get_sheet_tag_filter_server_snapshot(): readonly string[] {
  return EMPTY_SHEET_TAG_FILTER;
}
