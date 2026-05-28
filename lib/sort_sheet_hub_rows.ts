import { type SheetHubRow } from "@/lib/types/sheet_hub";

/**
 * Sorts hub rows with running timers first, then by most recent activity.
 */
export function sort_sheet_hub_rows(rows: SheetHubRow[]): SheetHubRow[] {
  return [...rows].sort((left, right) => {
    if (left.hasActiveEntry !== right.hasActiveEntry) {
      return left.hasActiveEntry ? -1 : 1;
    }

    const left_ms =
      left.lastActivityAt === null ? 0 : +new Date(left.lastActivityAt);
    const right_ms =
      right.lastActivityAt === null ? 0 : +new Date(right.lastActivityAt);

    return right_ms - left_ms;
  });
}
