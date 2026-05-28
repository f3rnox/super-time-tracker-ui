import { addDays, startOfDay, subDays } from "date-fns";

import { get_activity_heatmap } from "@/lib/get_activity_heatmap";
import { get_daily_time_buckets } from "@/lib/get_daily_time_buckets";
import { get_focus_pattern_insights } from "@/lib/get_focus_pattern_insights";
import { get_month_in_review_stats } from "@/lib/get_month_in_review_stats";
import { get_period_trend_comparison } from "@/lib/get_period_trend_comparison";
import { get_tag_time_breakdown } from "@/lib/get_tag_time_breakdown";
import { get_weekday_distribution } from "@/lib/get_weekday_distribution";
import { type PeriodRangeMs } from "@/lib/get_period_range_ms";
import { type ReportingAnalytics } from "@/lib/types/reporting";
import { type TimeSheet } from "@/lib/types";

const DEFAULT_DAILY_WINDOW_DAYS = 30;

/**
 * Builds the dashboard analytics bundle, using the active range when provided.
 */
export function build_reporting_analytics(
  sheets: TimeSheet[],
  range: PeriodRangeMs | null,
  now: number = Date.now(),
  week_starts_on: 0 | 1 = 1,
): ReportingAnalytics {
  const reference_now = new Date(now);
  const default_range_end = +addDays(startOfDay(reference_now), 1) - 1;
  const default_range_start = +startOfDay(
    subDays(reference_now, DEFAULT_DAILY_WINDOW_DAYS - 1),
  );

  const daily_range_start =
    range === null ? default_range_start : range.startMs;
  const daily_range_end = range === null ? default_range_end : range.endMs;

  const daily_buckets = get_daily_time_buckets(
    sheets,
    daily_range_start,
    daily_range_end,
    now,
  );
  const tag_breakdown = get_tag_time_breakdown(
    sheets,
    daily_range_start,
    daily_range_end,
    now,
  );
  const weekday_distribution = get_weekday_distribution(
    daily_buckets,
    week_starts_on,
  );
  const heatmap = get_activity_heatmap(
    sheets,
    daily_range_start,
    daily_range_end,
    now,
  );

  return {
    dailyBuckets: daily_buckets,
    tagBreakdown: tag_breakdown,
    weekdayDistribution: weekday_distribution,
    heatmap,
    weekTrend: get_period_trend_comparison(
      sheets,
      "week",
      reference_now,
      now,
      week_starts_on,
    ),
    monthTrend: get_period_trend_comparison(
      sheets,
      "month",
      reference_now,
      now,
      week_starts_on,
    ),
    monthInReview: get_month_in_review_stats(sheets, reference_now, now),
    focusInsights: get_focus_pattern_insights(
      sheets,
      { startMs: daily_range_start, endMs: daily_range_end },
      now,
    ),
  };
}
