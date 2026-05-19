'use client'

import { useMemo } from 'react'

import { format_duration } from '@/lib/format_duration'
import { type HeatmapCell } from '@/lib/types/reporting'
import { type DurationFormat } from '@/lib/types/ui_preferences'
import { type WeekStartsOn } from '@/lib/types/ui_preferences'
import { week_starts_on_to_index } from '@/lib/week_starts_on_to_index'

interface ReportingActivityHeatmapProps {
  heatmap: HeatmapCell[]
  duration_format: DurationFormat
  week_starts_on: WeekStartsOn
}

const HOURS_IN_DAY = 24
const DAYS_IN_WEEK = 7
const WEEKDAY_LABELS_SUNDAY_FIRST = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOUR_LABEL_STEPS = [0, 6, 12, 18]

/**
 * Renders a weekday × hour-of-day activity heatmap with intensity shading.
 */
export function ReportingActivityHeatmap({
  heatmap,
  duration_format,
  week_starts_on,
}: ReportingActivityHeatmapProps) {
  const week_starts_index = week_starts_on_to_index(week_starts_on)
  const ordered_weekday_indices = useMemo(
    () =>
      Array.from(
        { length: DAYS_IN_WEEK },
        (_, offset) => (week_starts_index + offset) % DAYS_IN_WEEK,
      ),
    [week_starts_index],
  )

  const cell_lookup = useMemo(() => {
    const lookup = new Map<string, number>()
    for (const cell of heatmap) {
      lookup.set(`${cell.weekdayIndex}-${cell.hourIndex}`, cell.totalMs)
    }
    return lookup
  }, [heatmap])

  const max_cell_ms = useMemo(
    () => heatmap.reduce((max, cell) => Math.max(max, cell.totalMs), 0),
    [heatmap],
  )
  const total_ms = useMemo(
    () => heatmap.reduce((total, cell) => total + cell.totalMs, 0),
    [heatmap],
  )

  return (
    <section className="flex w-full flex-col gap-3 rounded-md border border-panel-border bg-panel p-4 shadow-sm">
      <header className="flex flex-col gap-0.5">
        <h3 className="m-0 text-[0.95rem] font-semibold">Activity heatmap</h3>
        <p className="m-0 text-[0.78rem] text-muted">
          When during the week you usually track time.
        </p>
      </header>
      {total_ms === 0 ? (
        <p className="m-0 py-6 text-center text-[0.85rem] text-muted">
          Once you start logging time, your weekly rhythm appears here.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[420px] pb-1">
            <div className="grid grid-cols-[2rem_1fr] gap-x-2">
              <div />
              <div className="relative h-3.5 w-full">
                {HOUR_LABEL_STEPS.map((hour) => (
                  <span
                    key={hour}
                    className="absolute -translate-x-1/2 text-[0.65rem] font-medium uppercase tracking-[0.06em] text-muted"
                    style={{ left: `${(hour / HOURS_IN_DAY) * 100}%` }}
                  >
                    {format_hour_label(hour)}
                  </span>
                ))}
              </div>
              {ordered_weekday_indices.map((weekday_index) => (
                <Row
                  key={weekday_index}
                  weekday_index={weekday_index}
                  cell_lookup={cell_lookup}
                  max_cell_ms={max_cell_ms}
                  duration_format={duration_format}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <footer className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[0.72rem] text-muted">
        <span>Less</span>
        <div className="flex items-center gap-1">
          {[0.15, 0.35, 0.6, 0.85, 1].map((intensity) => (
            <span
              key={intensity}
              className="inline-block h-3 w-4 rounded-sm"
              style={{
                backgroundColor: build_cell_color(intensity),
              }}
            />
          ))}
        </div>
        <span>More</span>
      </footer>
    </section>
  )
}

/**
 * Single weekday row in the heatmap with its 24 hourly cells.
 */
function Row({
  weekday_index,
  cell_lookup,
  max_cell_ms,
  duration_format,
}: {
  weekday_index: number
  cell_lookup: Map<string, number>
  max_cell_ms: number
  duration_format: DurationFormat
}) {
  return (
    <>
      <span className="self-center text-[0.7rem] font-medium uppercase tracking-[0.06em] text-muted">
        {WEEKDAY_LABELS_SUNDAY_FIRST[weekday_index]}
      </span>
      <div
        className="grid gap-[2px]"
        style={{
          gridTemplateColumns: `repeat(${HOURS_IN_DAY}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: HOURS_IN_DAY }, (_, hour) => {
          const total_ms = cell_lookup.get(`${weekday_index}-${hour}`) ?? 0
          const intensity = max_cell_ms > 0 ? total_ms / max_cell_ms : 0

          return (
            <span
              key={hour}
              className="block aspect-square min-h-[14px] rounded-[3px]"
              style={{
                backgroundColor: build_cell_color(intensity),
              }}
              title={`${WEEKDAY_LABELS_SUNDAY_FIRST[weekday_index]} ${format_hour_label(hour)}: ${format_duration(total_ms, duration_format)}`}
            />
          )
        })}
      </div>
    </>
  )
}

/**
 * Formats an hour index into a short label (12a / 6a / 12p / 6p).
 */
function format_hour_label(hour: number): string {
  if (hour === 0) {
    return '12a'
  }

  if (hour === 12) {
    return '12p'
  }

  if (hour < 12) {
    return `${hour}a`
  }

  return `${hour - 12}p`
}

/**
 * Returns the accent-based fill colour for a heatmap cell intensity.
 */
function build_cell_color(intensity: number): string {
  if (intensity <= 0) {
    return 'color-mix(in srgb, var(--surface-raised) 80%, transparent)'
  }

  const opacity_pct = Math.min(100, Math.round(intensity * 90) + 10)
  return `color-mix(in srgb, var(--accent) ${opacity_pct}%, transparent)`
}
