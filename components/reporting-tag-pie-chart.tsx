'use client'

import { useMemo } from 'react'

import { format_duration } from '@/lib/format_duration'
import { get_tag_chart_color } from '@/lib/get_tag_chart_color'
import { round_svg_coord } from '@/lib/round_svg_coord'
import { type DurationFormat } from '@/lib/types/ui_preferences'
import { type TagTimeStat } from '@/lib/types/reporting'

const RADIUS = 70
const INNER_RADIUS = 38
const CENTER = 80
const VIEWBOX_SIZE = CENTER * 2
const MAX_LEGEND_ITEMS = 8

interface ReportingTagPieChartProps {
  tag_breakdown: TagTimeStat[]
  duration_format: DurationFormat
}

interface PieSlice {
  tag: string
  color: string
  path_data: string
  ratio: number
  total_ms: number
}

/**
 * SVG donut chart showing time distribution across tags.
 */
export function ReportingTagPieChart({
  tag_breakdown,
  duration_format,
}: ReportingTagPieChartProps) {
  const slices = useMemo(
    () => build_slices(tag_breakdown),
    [tag_breakdown],
  )
  const total_ms = useMemo(
    () => tag_breakdown.reduce((total, stat) => total + stat.totalMs, 0),
    [tag_breakdown],
  )
  const legend_items = slices.slice(0, MAX_LEGEND_ITEMS)
  const remaining = Math.max(0, slices.length - MAX_LEGEND_ITEMS)

  if (slices.length === 0 || total_ms === 0) {
    return (
      <ChartShell title="Time by tag" subtitle="No tagged time in this period.">
        <EmptyPieIllustration />
      </ChartShell>
    )
  }

  return (
    <ChartShell
      title="Time by tag"
      subtitle="Multi-tag entries are split evenly across their tags."
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <svg
            viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
            className="h-40 w-40"
            role="img"
            aria-label="Tag time distribution"
          >
            {slices.length === 1 ? (
              <>
                <circle
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill={slices[0].color}
                />
                <circle
                  cx={CENTER}
                  cy={CENTER}
                  r={INNER_RADIUS}
                  fill="var(--panel)"
                />
              </>
            ) : (
              slices.map((slice) => (
                <path
                  key={slice.tag}
                  d={slice.path_data}
                  fill={slice.color}
                />
              ))
            )}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted">
              Total
            </span>
            <span className="font-mono text-[0.85rem] font-semibold">
              {format_duration(total_ms, duration_format)}
            </span>
          </div>
        </div>
        <ul className="m-0 flex w-full flex-col gap-1.5 p-0">
          {legend_items.map((slice) => (
            <li
              key={slice.tag}
              className="flex items-center gap-2 text-[0.82rem]"
            >
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: slice.color }}
              />
              <span className="min-w-0 flex-1 truncate font-medium">
                {slice.tag}
              </span>
              <span className="shrink-0 font-mono text-muted">
                {Math.round(slice.ratio * 100)}%
              </span>
              <span className="shrink-0 font-mono text-foreground">
                {format_duration(slice.total_ms, duration_format)}
              </span>
            </li>
          ))}
          {remaining > 0 ? (
            <li className="text-[0.78rem] text-muted">
              + {remaining} more {remaining === 1 ? 'tag' : 'tags'}
            </li>
          ) : null}
        </ul>
      </div>
    </ChartShell>
  )
}

/**
 * Wraps a chart with a consistent panel, title, and optional subtitle.
 */
function ChartShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex w-full flex-col gap-3 rounded-md border border-panel-border bg-panel p-4 shadow-sm">
      <header className="flex flex-col gap-0.5">
        <h3 className="m-0 text-[0.95rem] font-semibold">{title}</h3>
        {subtitle !== undefined ? (
          <p className="m-0 text-[0.78rem] text-muted">{subtitle}</p>
        ) : null}
      </header>
      {children}
    </section>
  )
}

/**
 * Renders a faint placeholder donut when there is no tagged data.
 */
function EmptyPieIllustration() {
  return (
    <div className="flex flex-col items-center gap-2 py-3 text-center">
      <svg
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        className="h-28 w-28 opacity-40"
        role="presentation"
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--panel-border)"
          strokeWidth={RADIUS - INNER_RADIUS}
        />
      </svg>
      <p className="m-0 text-[0.82rem] text-muted">
        Tag your entries to see time distribution here.
      </p>
    </div>
  )
}

/**
 * Builds SVG donut slice paths and metadata for the provided tag breakdown.
 */
function build_slices(tag_breakdown: TagTimeStat[]): PieSlice[] {
  const total_ms = tag_breakdown.reduce(
    (total, stat) => total + stat.totalMs,
    0,
  )

  if (total_ms === 0) {
    return []
  }

  const slices: PieSlice[] = []
  let cumulative_ratio = 0

  tag_breakdown.forEach((stat, index) => {
    if (stat.totalMs <= 0) {
      return
    }

    const ratio = stat.totalMs / total_ms
    const start_angle = cumulative_ratio * Math.PI * 2
    const end_angle = (cumulative_ratio + ratio) * Math.PI * 2
    cumulative_ratio += ratio

    slices.push({
      tag: stat.tag,
      color: get_tag_chart_color(stat.tag, index),
      ratio,
      total_ms: stat.totalMs,
      path_data: build_donut_slice_path(start_angle, end_angle),
    })
  })

  return slices
}

/**
 * Builds an SVG donut slice path between two radian angles.
 */
function build_donut_slice_path(
  start_angle: number,
  end_angle: number,
): string {
  const outer_start = polar_to_cartesian(start_angle, RADIUS)
  const outer_end = polar_to_cartesian(end_angle, RADIUS)
  const inner_end = polar_to_cartesian(end_angle, INNER_RADIUS)
  const inner_start = polar_to_cartesian(start_angle, INNER_RADIUS)
  const large_arc_flag = end_angle - start_angle > Math.PI ? 1 : 0

  return [
    `M ${outer_start.x} ${outer_start.y}`,
    `A ${RADIUS} ${RADIUS} 0 ${large_arc_flag} 1 ${outer_end.x} ${outer_end.y}`,
    `L ${inner_end.x} ${inner_end.y}`,
    `A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${large_arc_flag} 0 ${inner_start.x} ${inner_start.y}`,
    'Z',
  ].join(' ')
}

/**
 * Converts a polar coordinate centred on the chart into SVG-friendly cartesian space.
 */
function polar_to_cartesian(
  angle_radians: number,
  radius: number,
): { x: number; y: number } {
  return {
    x: round_svg_coord(CENTER + radius * Math.sin(angle_radians)),
    y: round_svg_coord(CENTER - radius * Math.cos(angle_radians)),
  }
}
