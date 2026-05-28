import { type SerializedSheet } from "@/lib/types/tracker_state";

/**
 * Returns the next or previous sheet name relative to the active sheet.
 */
export function get_adjacent_sheet_name(
  sheets: SerializedSheet[],
  active_sheet_name: string,
  direction: "previous" | "next",
): string | null {
  if (sheets.length === 0) {
    return null;
  }

  const active_index = sheets.findIndex(
    (sheet) => sheet.name === active_sheet_name,
  );
  const current_index = active_index === -1 ? 0 : active_index;
  const offset = direction === "next" ? 1 : -1;
  const next_index = (current_index + offset + sheets.length) % sheets.length;

  return sheets[next_index]?.name ?? null;
}
