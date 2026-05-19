'use client'

import { useMemo } from 'react'

import { format_duration } from '@/lib/format_duration'
import { round_chart_percent } from '@/lib/round_chart_percent'
import { type DailyTimeBucket } from '@/lib/types/reporting'
import { type DurationFormat } from '@/lib/types/ui_preferences'

interface ReportingDailyBarChartProps {
  daily_buckets: DailyTimeBucket[]
  duration_format: DurationFormat
  title?: string
  subtitle?: string
}

const MAX_VISIBLE_DAYS = 60

/**
 * Vertical bar chart showing time tracked per day with weekend highlighting.
 */
export function ReportingDailyBarChart({
  daily_buckets,
  duration_format,
  title = 'Time over days',
  subtitle,
}: ReportingDailyBarChartProps) {
  const visible_buckets = useMemo(
    () => daily_buckets.slice(-MAX_VISIBLE_DAYS),
    [daily_buckets],
  )
  const max_ms = useMemo(
    () =>
      visible_buckets.reduce(
        (max, bucket) => Math.max(max, bucket.totalMs),
        0,
      ),
    [visible_buckets],
  )
  const total_ms = useMemo(
    () => visible_buckets.reduce((total, bucket) => total + bucket.totalMs, 0),
    [visible_buckets],
  )
  const average_ms = useMemo(() => {
    const days_with_time = visible_buckets.filter(
      (bucket) => bucket.totalMs > 0,
    ).length
    return days_with_time === 0 ? 0 : total_ms / days_with_time
  }, [visible_buckets, total_ms])

  const subtitle_text =
    subtitle ??
    (visible_buckets.length === 0
      ? 'No data in this period.'
      : `${visible_buckets.length} day${visible_buckets.length === 1 ? '' : 's'} · avg ${format_duration(average_ms, duration_format)} on active days`)

  return (
    <section className="flex w-full flex-col gap-3 rounded-md border border-panel-border bg-panel p-4 shadow-sm">
      <header className="flex flex-col gap-0.5">
        <h3 className="m-0 text-[0.95rem] font-semibold">{title}</h3>
        <p className="m-0 text-[0.78rem] text-muted">{subtitle_text}</p>
      </header>
      {visible_buckets.length === 0 ? (
        <p className="m-0 py-6 text-center text-[0.85rem] text-muted">
          Track time to populate this chart.
        </p>
      ) : (
        <div className="flex h-44 items-end gap-[3px] overflow-x-auto pb-2">
          {visible_buckets.map((bucket) => {
            const height_percent =
              max_ms > 0
                ? round_chart_percent((bucket.totalMs / max_ms) * 100)
                : 0
            const is_weekend =
              bucket.weekdayIndex === 0 || bucket.weekdayIndex === 6
            const has_time = bucket.totalMs > 0
            const fill_class = !has_time
              ? 'bg-surface-raised'
              : is_weekend
                ? 'bg-accent/60'
                : 'bg-accent'

            return (
              <div
                key={bucket.dateMs}
                className="flex h-full min-w-[6px] flex-1 flex-col justify-end"
                title={`${bucket.dateLabel} · ${format_duration(bucket.totalMs, duration_format)}`}
                role="img"
                aria-label={`${bucket.dateLabel}: ${format_duration(bucket.totalMs, duration_format)}`}
              >
                <div
                  className={`w-full rounded-t-sm transition-all ${fill_class}`}
                  style={{
                    height: has_time ? `${Math.max(2, height_percent)}%` : '2px',
                  }}
                />
              </div>
            )
          })}
        </div>
      )}
      <footer className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[0.72rem] text-muted">
        <span>
          {visible_buckets.length > 0
            ? `${visible_buckets[0].dateLabel} → ${visible_buckets[visible_buckets.length - 1].dateLabel}`
            : ''}
        </span>
        <span>
          Total {format_duration(total_ms, duration_format)} · Peak{' '}
          {format_duration(max_ms, duration_format)}
        </span>
      </footer>
    </section>
  )
}
