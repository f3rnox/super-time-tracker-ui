import { format, startOfDay } from "date-fns";

import { type PeriodRangeMs } from "@/lib/get_period_range_ms";
import {
  type FocusHourInsight,
  type FocusPatternInsights,
  type RecurringIdleWindowInsight,
  type SheetStartSuggestionInsight,
} from "@/lib/types/reporting";
import { type TimeSheet } from "@/lib/types";

const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const DEEP_WORK_THRESHOLD_MS = 45 * MINUTE_MS;
const INTERRUPTION_GAP_THRESHOLD_MS = 15 * MINUTE_MS;
const IDLE_WINDOW_THRESHOLD_MS = 30 * MINUTE_MS;
const MAX_INSIGHT_ITEMS = 3;

interface FocusInterval {
  sheetName: string;
  startMs: number;
  endMs: number;
  durationMs: number;
}

interface HourAggregate {
  hourIndex: number;
  totalMs: number;
  entryKeys: Set<string>;
}

/**
 * Builds interpretive focus-pattern analytics for a reporting range.
 */
export function get_focus_pattern_insights(
  sheets: TimeSheet[],
  range: PeriodRangeMs,
  now: number = Date.now(),
): FocusPatternInsights {
  const intervals = collect_focus_intervals(sheets, range, now);
  const active_day_count = get_active_day_count(intervals);
  const brief_gaps = collect_same_day_gaps(intervals).filter(
    (gap) =>
      gap.durationMs > 0 && gap.durationMs <= INTERRUPTION_GAP_THRESHOLD_MS,
  );
  const context_switch_count = count_context_switches(intervals);
  const longest_deep_work_streak = get_longest_deep_work_streak(intervals);

  return {
    activeDayCount: active_day_count,
    bestFocusHours: collect_best_focus_hours(intervals),
    interruptionCount: brief_gaps.length,
    interruptionFrequencyPerDay: get_rate(brief_gaps.length, active_day_count),
    contextSwitchCount: context_switch_count,
    contextSwitchesPerDay: get_rate(context_switch_count, active_day_count),
    longestDeepWorkStreakMs: longest_deep_work_streak.totalMs,
    longestDeepWorkStreakEntryCount: longest_deep_work_streak.entryCount,
    recurringIdleWindows: collect_recurring_idle_windows(intervals),
    sheetStartSuggestions: collect_sheet_start_suggestions(intervals),
    deepWorkThresholdMs: DEEP_WORK_THRESHOLD_MS,
    interruptionGapThresholdMs: INTERRUPTION_GAP_THRESHOLD_MS,
    idleWindowThresholdMs: IDLE_WINDOW_THRESHOLD_MS,
  };
}

function collect_focus_intervals(
  sheets: TimeSheet[],
  range: PeriodRangeMs,
  now: number,
): FocusInterval[] {
  const intervals: FocusInterval[] = [];

  for (const sheet of sheets) {
    for (const entry of sheet.entries) {
      const raw_end_ms = entry.end === null ? now : entry.end.getTime();
      const start_ms = Math.max(entry.start.getTime(), range.startMs);
      const end_ms = Math.min(raw_end_ms, range.endMs);

      if (end_ms <= start_ms) {
        continue;
      }

      intervals.push({
        sheetName: sheet.name,
        startMs: start_ms,
        endMs: end_ms,
        durationMs: end_ms - start_ms,
      });
    }
  }

  return intervals.sort((left, right) => left.startMs - right.startMs);
}

function collect_best_focus_hours(
  intervals: FocusInterval[],
): FocusHourInsight[] {
  const aggregates = new Map<number, HourAggregate>();

  for (const interval of intervals) {
    let cursor = startOfHourMs(interval.startMs);

    while (cursor < interval.endMs) {
      const hour_index = new Date(cursor).getHours();
      const hour_end_ms = cursor + HOUR_MS;
      const clipped_start_ms = Math.max(interval.startMs, cursor);
      const clipped_end_ms = Math.min(interval.endMs, hour_end_ms);
      const duration_ms = Math.max(0, clipped_end_ms - clipped_start_ms);

      if (duration_ms > 0) {
        const aggregate = aggregates.get(hour_index) ?? {
          hourIndex: hour_index,
          totalMs: 0,
          entryKeys: new Set<string>(),
        };

        aggregate.totalMs += duration_ms;
        aggregate.entryKeys.add(
          `${interval.sheetName}:${interval.startMs}:${interval.endMs}`,
        );
        aggregates.set(hour_index, aggregate);
      }

      cursor = hour_end_ms;
    }
  }

  return Array.from(aggregates.values())
    .sort((left, right) => right.totalMs - left.totalMs)
    .slice(0, MAX_INSIGHT_ITEMS)
    .map((aggregate) => ({
      hourIndex: aggregate.hourIndex,
      hourLabel: format_hour_label(aggregate.hourIndex),
      totalMs: aggregate.totalMs,
      entryCount: aggregate.entryKeys.size,
    }));
}

function collect_same_day_gaps(
  intervals: FocusInterval[],
): { startMs: number; endMs: number; durationMs: number }[] {
  const gaps: { startMs: number; endMs: number; durationMs: number }[] = [];

  for (let index = 1; index < intervals.length; index += 1) {
    const previous = intervals[index - 1];
    const current = intervals[index];

    if (
      previous === undefined ||
      current === undefined ||
      !is_same_day(previous.endMs, current.startMs)
    ) {
      continue;
    }

    const duration_ms = current.startMs - previous.endMs;

    if (duration_ms <= 0) {
      continue;
    }

    gaps.push({
      startMs: previous.endMs,
      endMs: current.startMs,
      durationMs: duration_ms,
    });
  }

  return gaps;
}

function count_context_switches(intervals: FocusInterval[]): number {
  let count = 0;

  for (let index = 1; index < intervals.length; index += 1) {
    const previous = intervals[index - 1];
    const current = intervals[index];

    if (
      previous !== undefined &&
      current !== undefined &&
      previous.sheetName !== current.sheetName &&
      is_same_day(previous.endMs, current.startMs)
    ) {
      count += 1;
    }
  }

  return count;
}

function get_longest_deep_work_streak(intervals: FocusInterval[]): {
  totalMs: number;
  entryCount: number;
} {
  let current_total_ms = 0;
  let current_entry_count = 0;
  let current_end_ms: number | null = null;
  let best_total_ms = 0;
  let best_entry_count = 0;

  for (const interval of intervals) {
    if (interval.durationMs < DEEP_WORK_THRESHOLD_MS) {
      if (current_total_ms > best_total_ms) {
        best_total_ms = current_total_ms;
        best_entry_count = current_entry_count;
      }

      current_total_ms = 0;
      current_entry_count = 0;
      current_end_ms = null;
      continue;
    }

    const can_continue =
      current_end_ms !== null &&
      interval.startMs - current_end_ms <= INTERRUPTION_GAP_THRESHOLD_MS &&
      is_same_day(current_end_ms, interval.startMs);

    if (!can_continue) {
      if (current_total_ms > best_total_ms) {
        best_total_ms = current_total_ms;
        best_entry_count = current_entry_count;
      }

      current_total_ms = 0;
      current_entry_count = 0;
    }

    current_total_ms += interval.durationMs;
    current_entry_count += 1;
    current_end_ms = interval.endMs;
  }

  if (current_total_ms > best_total_ms) {
    best_total_ms = current_total_ms;
    best_entry_count = current_entry_count;
  }

  return { totalMs: best_total_ms, entryCount: best_entry_count };
}

function collect_recurring_idle_windows(
  intervals: FocusInterval[],
): RecurringIdleWindowInsight[] {
  const gaps = collect_same_day_gaps(intervals).filter(
    (gap) => gap.durationMs >= IDLE_WINDOW_THRESHOLD_MS,
  );
  const by_hour = new Map<
    number,
    { hourIndex: number; dayKeys: Set<number>; totalIdleMs: number }
  >();

  for (const gap of gaps) {
    let cursor = startOfHourMs(gap.startMs);

    while (cursor < gap.endMs) {
      const hour_index = new Date(cursor).getHours();
      const hour_end_ms = cursor + HOUR_MS;
      const clipped_start_ms = Math.max(gap.startMs, cursor);
      const clipped_end_ms = Math.min(gap.endMs, hour_end_ms);
      const duration_ms = Math.max(0, clipped_end_ms - clipped_start_ms);

      if (duration_ms > 0) {
        const aggregate = by_hour.get(hour_index) ?? {
          hourIndex: hour_index,
          dayKeys: new Set<number>(),
          totalIdleMs: 0,
        };

        aggregate.dayKeys.add(+startOfDay(new Date(gap.startMs)));
        aggregate.totalIdleMs += duration_ms;
        by_hour.set(hour_index, aggregate);
      }

      cursor = hour_end_ms;
    }
  }

  return Array.from(by_hour.values())
    .filter((aggregate) => aggregate.dayKeys.size >= 2)
    .sort((left, right) => {
      if (right.dayKeys.size !== left.dayKeys.size) {
        return right.dayKeys.size - left.dayKeys.size;
      }

      return right.totalIdleMs - left.totalIdleMs;
    })
    .slice(0, MAX_INSIGHT_ITEMS)
    .map((aggregate) => ({
      hourIndex: aggregate.hourIndex,
      hourLabel: format_hour_label(aggregate.hourIndex),
      dayCount: aggregate.dayKeys.size,
      totalIdleMs: aggregate.totalIdleMs,
    }));
}

function collect_sheet_start_suggestions(
  intervals: FocusInterval[],
): SheetStartSuggestionInsight[] {
  const by_sheet = new Map<string, Map<number, number>>();

  for (const interval of intervals) {
    const hour = new Date(interval.startMs).getHours();
    const sheet_counts = by_sheet.get(interval.sheetName) ?? new Map();
    sheet_counts.set(hour, (sheet_counts.get(hour) ?? 0) + 1);
    by_sheet.set(interval.sheetName, sheet_counts);
  }

  const suggestions: SheetStartSuggestionInsight[] = [];

  for (const [sheet_name, hour_counts] of by_sheet) {
    const total_starts = Array.from(hour_counts.values()).reduce(
      (total, count) => total + count,
      0,
    );

    if (total_starts < 3) {
      continue;
    }

    const [hour_index, start_count] = Array.from(hour_counts.entries()).sort(
      (left, right) => right[1] - left[1],
    )[0] ?? [0, 0];

    if (start_count < 2) {
      continue;
    }

    suggestions.push({
      sheetName: sheet_name,
      hourIndex: hour_index,
      hourLabel: format_hour_label(hour_index),
      startCount: start_count,
      confidence: start_count / total_starts,
    });
  }

  return suggestions
    .sort((left, right) => {
      if (right.confidence !== left.confidence) {
        return right.confidence - left.confidence;
      }

      return right.startCount - left.startCount;
    })
    .slice(0, MAX_INSIGHT_ITEMS);
}

function get_active_day_count(intervals: FocusInterval[]): number {
  return new Set(intervals.map((interval) => +startOfDay(interval.startMs)))
    .size;
}

function get_rate(count: number, active_day_count: number): number {
  return active_day_count > 0 ? count / active_day_count : 0;
}

function is_same_day(left_ms: number, right_ms: number): boolean {
  const left = new Date(left_ms);
  const right = new Date(right_ms);

  return +startOfDay(left) === +startOfDay(right);
}

function startOfHourMs(value_ms: number): number {
  const date = new Date(value_ms);
  date.setMinutes(0, 0, 0);
  return date.getTime();
}

function format_hour_label(hour_index: number): string {
  const date = new Date();
  date.setHours(hour_index, 0, 0, 0);
  return format(date, "haaa");
}
