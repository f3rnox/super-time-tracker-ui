import { format } from "date-fns";

import { collect_known_tags } from "@/lib/collect_known_tags";
import { filter_visible_sheets } from "@/lib/filter_visible_sheets";
import { find_all_serialized_active_entries } from "@/lib/find_all_serialized_active_entries";
import { get_clipped_entry_duration_ms } from "@/lib/get_clipped_entry_duration_ms";
import { get_period_range_ms } from "@/lib/get_period_range_ms";
import { is_entry_archived } from "@/lib/is_entry_archived";
import { is_entry_in_day } from "@/lib/is_entry_in_day";
import { is_sheet_archived } from "@/lib/is_sheet_archived";
import { read_db } from "@/lib/read_db";
import { serialize_entry } from "@/lib/serialize_entry";
import {
  type EndOfDayReviewEntry,
  type EndOfDayReviewIdleGap,
  type EndOfDayReviewPageData,
  type EndOfDayReviewTagIssue,
  type EndOfDayReviewTagIssueKind,
} from "@/lib/types/end_of_day_review";

const long_entry_threshold_ms = 3 * 60 * 60 * 1000;
const idle_gap_threshold_ms = 15 * 60 * 1000;

interface OccupiedInterval {
  startMs: number;
  endMs: number;
  firstEntry: EndOfDayReviewEntry;
  lastEntry: EndOfDayReviewEntry;
}

/**
 * Builds the end-of-day review checklist for the current calendar day.
 */
export async function get_end_of_day_review_page_data(
  now: number = Date.now(),
): Promise<EndOfDayReviewPageData> {
  const db = await read_db();
  const reference_date = new Date(now);
  const { startMs, endMs } = get_period_range_ms("today", reference_date);
  const entries: EndOfDayReviewEntry[] = [];

  for (const sheet of db.sheets) {
    if (is_sheet_archived(sheet)) {
      continue;
    }

    for (const entry of sheet.entries) {
      if (is_entry_archived(entry) || !is_entry_in_day(reference_date, entry)) {
        continue;
      }

      const review_duration_ms = get_clipped_entry_duration_ms(
        entry,
        startMs,
        endMs,
        now,
      );

      if (review_duration_ms <= 0) {
        continue;
      }

      entries.push({
        ...serialize_entry(
          entry,
          sheet.name,
          sheet.activeEntryID === entry.id && entry.end === null,
        ),
        reviewDurationMs: review_duration_ms,
      });
    }
  }

  const sorted_entries = entries.sort(
    (left, right) => +new Date(left.start) - +new Date(right.start),
  );

  return {
    dateLabel: format(reference_date, "EEEE, MMM d"),
    reviewStart: new Date(startMs).toISOString(),
    reviewEnd: new Date(Math.min(now, endMs)).toISOString(),
    runningEntries: find_all_serialized_active_entries(db),
    entries: sorted_entries,
    longEntries: collect_long_entries(sorted_entries),
    tagIssues: collect_tag_issues(sorted_entries),
    idleGaps: collect_idle_gaps(sorted_entries, startMs, endMs, now),
    sheetNames: filter_visible_sheets(db.sheets).map((sheet) => sheet.name),
    knownTags: collect_known_tags(db),
    longEntryThresholdMs: long_entry_threshold_ms,
    idleGapThresholdMs: idle_gap_threshold_ms,
  };
}

function collect_long_entries(
  entries: EndOfDayReviewEntry[],
): EndOfDayReviewEntry[] {
  return entries
    .filter((entry) => entry.reviewDurationMs >= long_entry_threshold_ms)
    .sort((left, right) => right.reviewDurationMs - left.reviewDurationMs);
}

function collect_tag_issues(
  entries: EndOfDayReviewEntry[],
): EndOfDayReviewTagIssue[] {
  const issues: EndOfDayReviewTagIssue[] = [];

  for (const entry of entries) {
    const kinds: EndOfDayReviewTagIssueKind[] = [];

    if (entry.tags.length === 0) {
      kinds.push("missing_tags");
    }

    if (entry.tags.some((tag) => tag !== tag.toLowerCase())) {
      kinds.push("tag_casing");
    }

    if (kinds.length > 0) {
      issues.push({ entry, kinds });
    }
  }

  return issues;
}

function collect_idle_gaps(
  entries: EndOfDayReviewEntry[],
  day_start_ms: number,
  day_end_ms: number,
  now: number,
): EndOfDayReviewIdleGap[] {
  const intervals = merge_occupied_intervals(
    entries
      .map((entry) => {
        const entry_start_ms = Math.max(+new Date(entry.start), day_start_ms);
        const raw_entry_end_ms =
          entry.end === null ? now : +new Date(entry.end);
        const entry_end_ms = Math.min(raw_entry_end_ms, day_end_ms);

        return {
          startMs: entry_start_ms,
          endMs: entry_end_ms,
          firstEntry: entry,
          lastEntry: entry,
        };
      })
      .filter((interval) => interval.endMs > interval.startMs),
  );

  const gaps: EndOfDayReviewIdleGap[] = [];

  for (let index = 1; index < intervals.length; index += 1) {
    const previous = intervals[index - 1];
    const next = intervals[index];

    if (previous === undefined || next === undefined) {
      continue;
    }

    const duration_ms = next.startMs - previous.endMs;

    if (duration_ms < idle_gap_threshold_ms) {
      continue;
    }

    gaps.push({
      id: `gap-${previous.endMs}-${next.startMs}`,
      start: new Date(previous.endMs).toISOString(),
      end: new Date(next.startMs).toISOString(),
      durationMs: duration_ms,
      previousEntry: previous.lastEntry,
      nextEntry: next.firstEntry,
    });
  }

  return gaps;
}

function merge_occupied_intervals(
  intervals: OccupiedInterval[],
): OccupiedInterval[] {
  const sorted = intervals.sort((left, right) => left.startMs - right.startMs);
  const merged: OccupiedInterval[] = [];

  for (const interval of sorted) {
    const current = merged.at(-1);

    if (current === undefined || interval.startMs > current.endMs) {
      merged.push({ ...interval });
      continue;
    }

    if (interval.endMs >= current.endMs) {
      current.endMs = interval.endMs;
      current.lastEntry = interval.lastEntry;
    }
  }

  return merged;
}
