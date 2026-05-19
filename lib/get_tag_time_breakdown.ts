import { get_clipped_entry_duration_ms } from "@/lib/get_clipped_entry_duration_ms";
import { normalize_stored_tag } from "@/lib/normalize_stored_tag";
import { type TagTimeStat } from "@/lib/types/reporting";
import { type TimeSheet } from "@/lib/types";

const UNTAGGED_LABEL = "Untagged";

/**
 * Aggregates time spent per tag, allocating multi-tag entries evenly across tags.
 */
export function get_tag_time_breakdown(
  sheets: TimeSheet[],
  range_start_ms: number,
  range_end_ms: number,
  now: number = Date.now(),
): TagTimeStat[] {
  const totals = new Map<string, number>();
  let total_ms = 0;

  for (const sheet of sheets) {
    for (const entry of sheet.entries) {
      const duration_ms = get_clipped_entry_duration_ms(
        entry,
        range_start_ms,
        range_end_ms,
        now,
      );

      if (duration_ms <= 0) {
        continue;
      }

      const normalized_tags: string[] = [];

      for (const tag of entry.tags) {
        try {
          normalized_tags.push(normalize_stored_tag(tag));
        } catch {
          continue;
        }
      }

      const unique_tags = [...new Set(normalized_tags)];

      total_ms += duration_ms;

      if (unique_tags.length === 0) {
        totals.set(
          UNTAGGED_LABEL,
          (totals.get(UNTAGGED_LABEL) ?? 0) + duration_ms,
        );
        continue;
      }

      const share = duration_ms / unique_tags.length;

      for (const tag of unique_tags) {
        totals.set(tag, (totals.get(tag) ?? 0) + share);
      }
    }
  }

  const entries = [...totals.entries()].map(
    ([tag, ms]): TagTimeStat => ({
      tag,
      totalMs: ms,
      ratio: total_ms > 0 ? ms / total_ms : 0,
    }),
  );

  entries.sort((left, right) => {
    if (left.tag === UNTAGGED_LABEL) {
      return 1;
    }
    if (right.tag === UNTAGGED_LABEL) {
      return -1;
    }
    return right.totalMs - left.totalMs;
  });

  return entries;
}
