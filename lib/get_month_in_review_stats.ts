import { endOfMonth, format, getDaysInMonth, startOfMonth } from "date-fns";

import { get_clipped_entry_duration_ms } from "@/lib/get_clipped_entry_duration_ms";
import { get_current_tracking_streak_days } from "@/lib/get_current_tracking_streak_days";
import { get_daily_time_buckets } from "@/lib/get_daily_time_buckets";
import { get_tag_time_breakdown } from "@/lib/get_tag_time_breakdown";
import { type MonthInReviewStats } from "@/lib/types/reporting";
import { type TimeSheet } from "@/lib/types";

/**
 * Builds a 'month in review' summary using the supplied reference date.
 */
export function get_month_in_review_stats(
  sheets: TimeSheet[],
  reference: Date = new Date(),
  now: number = Date.now(),
): MonthInReviewStats {
  const start = startOfMonth(reference);
  const end = endOfMonth(reference);
  const month_label = format(start, "MMMM yyyy");
  const days_in_month = getDaysInMonth(start);

  const daily_buckets = get_daily_time_buckets(sheets, +start, +end, now);
  const tag_breakdown = get_tag_time_breakdown(sheets, +start, +end, now);

  let total_ms = 0;
  let tracked_days = 0;
  let best_day_ms = 0;
  let best_day_ms_index = -1;

  daily_buckets.forEach((bucket, index) => {
    total_ms += bucket.totalMs;

    if (bucket.totalMs > 0) {
      tracked_days += 1;
    }

    if (bucket.totalMs > best_day_ms) {
      best_day_ms = bucket.totalMs;
      best_day_ms_index = index;
    }
  });

  let total_entries = 0;
  let longest_entry_ms = 0;
  const sheet_totals = new Map<string, number>();

  for (const sheet of sheets) {
    let sheet_ms = 0;

    for (const entry of sheet.entries) {
      const entry_ms = get_clipped_entry_duration_ms(entry, +start, +end, now);
      if (entry_ms <= 0) {
        continue;
      }

      total_entries += 1;
      sheet_ms += entry_ms;

      if (entry_ms > longest_entry_ms) {
        longest_entry_ms = entry_ms;
      }
    }

    if (sheet_ms > 0) {
      sheet_totals.set(sheet.name, sheet_ms);
    }
  }

  let top_sheet_name: string | null = null;
  let top_sheet_ms = 0;
  for (const [name, ms] of sheet_totals) {
    if (ms > top_sheet_ms) {
      top_sheet_ms = ms;
      top_sheet_name = name;
    }
  }

  let top_tag: string | null = null;
  let top_tag_ms = 0;
  for (const tag_stat of tag_breakdown) {
    if (tag_stat.tag === "Untagged") {
      continue;
    }
    if (tag_stat.totalMs > top_tag_ms) {
      top_tag_ms = tag_stat.totalMs;
      top_tag = tag_stat.tag;
    }
  }

  const current_streak_days = get_current_tracking_streak_days(
    sheets,
    reference,
    now,
  );
  const longest_streak_days = compute_longest_streak_in_buckets(daily_buckets);

  const best_day_label =
    best_day_ms_index === -1
      ? null
      : format(new Date(daily_buckets[best_day_ms_index].dateMs), "EEE, MMM d");

  const average_active_day_ms = tracked_days > 0 ? total_ms / tracked_days : 0;

  return {
    monthLabel: month_label,
    totalMs: total_ms,
    trackedDays: tracked_days,
    daysInMonth: days_in_month,
    bestDayMs: best_day_ms,
    bestDayLabel: best_day_label,
    longestEntryMs: longest_entry_ms,
    totalEntries: total_entries,
    topSheetName: top_sheet_name,
    topSheetMs: top_sheet_ms,
    topTag: top_tag,
    topTagMs: top_tag_ms,
    currentStreakDays: current_streak_days,
    longestStreakDays: longest_streak_days,
    averageActiveDayMs: average_active_day_ms,
  };
}

/**
 * Returns the longest run of consecutive tracked days within a month bucket list.
 */
function compute_longest_streak_in_buckets(
  daily_buckets: { totalMs: number }[],
): number {
  let longest = 0;
  let running = 0;

  for (const bucket of daily_buckets) {
    if (bucket.totalMs > 0) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  return longest;
}
