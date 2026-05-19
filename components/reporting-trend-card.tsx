'use client'

import { format_duration } from '@/lib/format_duration'
import { type PeriodTrendComparison } from '@/lib/types/reporting'
import { type DurationFormat } from '@/lib/types/ui_preferences'

interface ReportingTrendCardProps {
  trend: PeriodTrendComparison
  duration_format: DurationFormat
  current_label: string
  previous_label: string
}

/**
 * Compact trend card comparing the current period to the previous one.
 */
export function ReportingTrendCard({
  trend,
  duration_format,
  current_label,
  previous_label,
}: ReportingTrendCardProps) {
  const direction = build_direction(trend.deltaMs)
  const percent_text = build_percent_text(trend)

  return (
    <div className="flex flex-col gap-3 rounded-md border border-panel-border bg-panel p-4 shadow-sm">
      <header className="flex items-center justify-between gap-2">
        <h3 className="m-0 text-[0.95rem] font-semibold">{trend.label}</h3>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${direction.badge_class}`}
        >
          {direction.symbol} {percent_text}
        </span>
      </header>
      <dl className="m-0 grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-0.5">
          <dt className="m-0 text-[0.7rem] font-semibold uppercase tracking-[0.06em] text-muted">
            {current_label}
          </dt>
          <dd className="m-0 font-mono text-[1.05rem] font-semibold">
            {format_duration(trend.currentMs, duration_format)}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="m-0 text-[0.7rem] font-semibold uppercase tracking-[0.06em] text-muted">
            {previous_label}
          </dt>
          <dd className="m-0 font-mono text-[1.05rem] font-semibold text-muted">
            {format_duration(trend.previousMs, duration_format)}
          </dd>
        </div>
      </dl>
      <p className="m-0 text-[0.78rem] text-muted">
        {build_delta_summary(trend, duration_format)}
      </p>
    </div>
  )
}

/**
 * Returns badge styling and a directional arrow for the trend's delta.
 */
function build_direction(delta_ms: number): {
  symbol: string
  badge_class: string
} {
  if (delta_ms > 0) {
    return {
      symbol: '▲',
      badge_class:
        'bg-accent-soft text-accent border border-accent-border',
    }
  }

  if (delta_ms < 0) {
    return {
      symbol: '▼',
      badge_class:
        'bg-danger-soft text-danger border border-danger-border',
    }
  }

  return {
    symbol: '—',
    badge_class: 'bg-ghost-bg text-muted border border-panel-border',
  }
}

/**
 * Returns a short percent label, or 'new' when there is no previous baseline.
 */
function build_percent_text(trend: PeriodTrendComparison): string {
  if (trend.previousMs === 0) {
    return trend.currentMs === 0 ? '0%' : 'New'
  }

  const pct = Math.abs(trend.deltaRatio) * 100
  if (pct < 0.5) {
    return '~0%'
  }
  return `${pct >= 100 ? pct.toFixed(0) : pct.toFixed(1)}%`
}

/**
 * Builds a humanised delta summary line for the trend card body.
 */
function build_delta_summary(
  trend: PeriodTrendComparison,
  duration_format: DurationFormat,
): string {
  if (trend.previousMs === 0 && trend.currentMs === 0) {
    return 'No tracked time in either period.'
  }

  if (trend.previousMs === 0) {
    return `${format_duration(trend.currentMs, duration_format)} more than last period.`
  }

  if (trend.deltaMs === 0) {
    return 'Identical to the previous period.'
  }

  const direction = trend.deltaMs > 0 ? 'more' : 'less'
  return `${format_duration(Math.abs(trend.deltaMs), duration_format)} ${direction} than the previous period.`
}
