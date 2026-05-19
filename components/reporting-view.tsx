'use client'

import { type ReactNode, useMemo, useState } from 'react'

import { ReportingActivityHeatmap } from '@/components/reporting-activity-heatmap'
import { ReportingDailyBarChart } from '@/components/reporting-daily-bar-chart'
import { ReportingDateRangePicker } from '@/components/reporting-date-range-picker'
import { ReportingMonthInReview } from '@/components/reporting-month-in-review'
import { ReportingSortControls } from '@/components/reporting-sort-controls'
import { ReportingTagPieChart } from '@/components/reporting-tag-pie-chart'
import { ReportingTrendCard } from '@/components/reporting-trend-card'
import {
  ReportingViewTabs,
  type ReportingViewTab,
} from '@/components/reporting-view-tabs'
import { ReportingWeekdayBars } from '@/components/reporting-weekday-bars'
import { TrackerTopbar } from '@/components/tracker-topbar'
import { build_reporting_analytics } from '@/lib/build_reporting_analytics'
import { build_reporting_stats } from '@/lib/build_reporting_stats'
import { default_reporting_sort_preference } from '@/lib/preferences/default_reporting_sort_preference'
import { format_duration } from '@/lib/format_duration'
import { get_date_range_ms_from_inputs } from '@/lib/get_date_range_ms_from_inputs'
import { get_initial_reporting_range_inputs } from '@/lib/get_initial_reporting_range_inputs'
import { parse_reporting_source_sheets } from '@/lib/parse_reporting_source_sheets'
import { sort_sheet_report_stats } from '@/lib/sort_sheet_report_stats'
import { use_duration_format } from '@/lib/use_duration_format'
import { use_week_starts_on } from '@/lib/use_week_starts_on'
import { week_starts_on_to_index } from '@/lib/week_starts_on_to_index'
import {
  type ReportingDateRangeInputs,
  type ReportingSourceSheet,
  type SheetReportSort,
  type SheetReportStats,
} from '@/lib/types/reporting'

interface ReportingViewProps {
  source_sheets: ReportingSourceSheet[]
}

const empty_range: ReportingDateRangeInputs = {
  from_date: '',
  to_date: '',
}

/**
 * Reporting dashboard with tag/time charts, trends, and a month-in-review summary.
 */
export function ReportingView({ source_sheets }: ReportingViewProps) {
  const duration_format = use_duration_format()
  const week_starts_on = use_week_starts_on()
  const [active_tab, set_active_tab] = useState<ReportingViewTab>('dashboard')
  const [sort, set_sort] = useState<SheetReportSort>(() =>
    default_reporting_sort_preference.read(),
  )
  const [range_inputs, set_range_inputs] = useState<ReportingDateRangeInputs>(
    () => get_initial_reporting_range_inputs(undefined, week_starts_on),
  )

  const sheets = useMemo(
    () => parse_reporting_source_sheets(source_sheets),
    [source_sheets],
  )
  const date_range = useMemo(
    () =>
      get_date_range_ms_from_inputs(
        range_inputs.from_date,
        range_inputs.to_date,
      ),
    [range_inputs],
  )
  const range_is_partial =
    (range_inputs.from_date.length > 0) !==
    (range_inputs.to_date.length > 0)
  const range_is_invalid =
    range_is_partial ||
    (range_inputs.from_date.length > 0 &&
      range_inputs.to_date.length > 0 &&
      date_range === null)

  const week_starts_on_index = week_starts_on_to_index(week_starts_on)
  const { stats, analytics } = useMemo(() => {
    const now = Date.now()
    return {
      stats: build_reporting_stats(
        sheets,
        date_range,
        now,
        week_starts_on_index,
      ),
      analytics: build_reporting_analytics(
        sheets,
        date_range,
        now,
        week_starts_on_index,
      ),
    }
  }, [sheets, date_range, week_starts_on_index])

  const {
    activeSheets,
    grandAverageEntryMs,
    grandTotalMs,
    idleSheets,
    periodTotals,
    totalEntryCount,
  } = stats
  const sheet_count = activeSheets.length + idleSheets.length
  const show_period_totals = date_range === null

  const sorted_active_sheets = useMemo(
    () => sort_sheet_report_stats(activeSheets, sort),
    [activeSheets, sort],
  )
  const sorted_idle_sheets = useMemo(
    () => sort_sheet_report_stats(idleSheets, sort),
    [idleSheets, sort],
  )

  const bar_chart_subtitle =
    date_range === null
      ? 'Last 30 days of activity.'
      : `${analytics.dailyBuckets.length} days in the selected range.`

  return (
    <>
      <TrackerTopbar breadcrumb={{ current: 'Reporting' }} />
      <main className="mx-auto flex w-full max-w-[1120px] flex-col items-center gap-6 px-5 pb-12 pt-6">
        <header className="flex w-full max-w-2xl flex-col gap-3">
          <h1 className="m-0 text-center text-[1.5rem] font-[650] tracking-tight">
            Reporting
          </h1>
          <p className="m-0 max-w-md self-center text-center text-[0.9rem] leading-relaxed text-muted">
            {date_range === null
              ? 'A snapshot of where your time has been going.'
              : 'Metrics filtered to the selected date range.'}
          </p>
        </header>

        <ReportingViewTabs
          active_tab={active_tab}
          on_change={set_active_tab}
        />

        <ReportingDateRangePicker
          range={range_inputs}
          is_invalid={range_is_invalid}
          on_range_change={set_range_inputs}
          on_clear={() => set_range_inputs(empty_range)}
        />

        <section
          className="grid w-full max-w-5xl grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Summary"
        >
          <SummaryCard
            label={date_range === null ? 'Total tracked' : 'In range'}
            value={format_duration(grandTotalMs, duration_format)}
          />
          <SummaryCard
            label="Avg per entry"
            value={format_duration(grandAverageEntryMs, duration_format)}
          />
          <SummaryCard label="Sheets" value={String(sheet_count)} />
          <SummaryCard label="Entries" value={String(totalEntryCount)} />
        </section>

        {show_period_totals ? (
          <section
            className="grid w-full max-w-5xl grid-cols-1 gap-2 sm:grid-cols-3"
            aria-label="Period totals"
          >
            <SummaryCard
              label="Today"
              value={format_duration(periodTotals.todayMs, duration_format)}
            />
            <SummaryCard
              label="This week"
              value={format_duration(periodTotals.weekMs, duration_format)}
            />
            <SummaryCard
              label="This month"
              value={format_duration(periodTotals.monthMs, duration_format)}
            />
          </section>
        ) : null}

        {sheet_count === 0 ? (
          <p className="m-0 w-full max-w-2xl text-center text-[0.9rem] text-muted">
            No sheets yet. Create a sheet on the tracker to start logging time.
          </p>
        ) : range_is_invalid ? (
          <p className="m-0 w-full max-w-2xl text-center text-[0.9rem] text-muted">
            Choose both dates to filter metrics, or clear the range to see all
            time.
          </p>
        ) : active_tab === 'dashboard' ? (
          <DashboardLayout>
            <ReportingMonthInReview
              stats={analytics.monthInReview}
              duration_format={duration_format}
            />

            <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-2">
              <ReportingTrendCard
                trend={analytics.weekTrend}
                duration_format={duration_format}
                current_label="This week"
                previous_label="Last week"
              />
              <ReportingTrendCard
                trend={analytics.monthTrend}
                duration_format={duration_format}
                current_label="This month"
                previous_label="Last month"
              />
            </div>

            <ReportingDailyBarChart
              daily_buckets={analytics.dailyBuckets}
              duration_format={duration_format}
              subtitle={bar_chart_subtitle}
            />

            <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-2">
              <ReportingTagPieChart
                tag_breakdown={analytics.tagBreakdown}
                duration_format={duration_format}
              />
              <ReportingWeekdayBars
                weekday_distribution={analytics.weekdayDistribution}
                duration_format={duration_format}
              />
            </div>

            <ReportingActivityHeatmap
              heatmap={analytics.heatmap}
              duration_format={duration_format}
              week_starts_on={week_starts_on}
            />
          </DashboardLayout>
        ) : (
          <SheetsLayout>
            <ReportingSortControls sort={sort} on_sort_change={set_sort} />
            {activeSheets.length === 0 ? (
              <p className="m-0 w-full max-w-2xl text-center text-[0.9rem] text-muted">
                {date_range === null
                  ? 'No tracked time yet. Check in on a sheet to see stats here.'
                  : 'No tracked time in this date range.'}
              </p>
            ) : (
              <SheetStatsSection
                title="Tracked sheets"
                aria_label="Tracked sheet statistics"
              >
                {sorted_active_sheets.map((sheet) => (
                  <SheetStatsRow
                    key={sheet.sheetName}
                    sheet={sheet}
                    grand_total_ms={grandTotalMs}
                    duration_format={duration_format}
                  />
                ))}
              </SheetStatsSection>
            )}
            {idleSheets.length > 0 ? (
              <SheetStatsSection
                title={date_range === null ? 'Empty sheets' : 'Sheets in range'}
                aria_label="Sheets without time in range"
                muted
              >
                {sorted_idle_sheets.map((sheet) => (
                  <IdleSheetStatsRow
                    key={sheet.sheetName}
                    sheet={sheet}
                    in_range={date_range !== null}
                  />
                ))}
              </SheetStatsSection>
            ) : null}
          </SheetsLayout>
        )}
      </main>
    </>
  )
}

interface DashboardLayoutProps {
  children: ReactNode
}

/**
 * Vertical stack wrapper for the dashboard tab content.
 */
function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex w-full max-w-5xl flex-col gap-5">{children}</div>
  )
}

interface SheetsLayoutProps {
  children: ReactNode
}

/**
 * Centered narrow column wrapper for the per-sheet breakdown tab.
 */
function SheetsLayout({ children }: SheetsLayoutProps) {
  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4">
      {children}
    </div>
  )
}

interface SummaryCardProps {
  label: string
  value: string
}

/**
 * Compact summary metric for the reporting header.
 */
function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
      <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
        {label}
      </p>
      <p className="m-0 mt-1 text-[1.1rem] font-[650] tracking-tight">{value}</p>
    </div>
  )
}

interface SheetStatsSectionProps {
  title: string
  aria_label: string
  muted?: boolean
  children: ReactNode
}

/**
 * Grouped list of sheet statistics with a section heading.
 */
function SheetStatsSection({
  title,
  aria_label,
  muted = false,
  children,
}: SheetStatsSectionProps) {
  return (
    <section className="flex w-full max-w-2xl flex-col gap-2">
      <h2
        className={`m-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em] ${
          muted ? 'text-muted' : 'text-foreground'
        }`}
      >
        {title}
      </h2>
      <ul
        className="m-0 flex list-none flex-col gap-2 p-0"
        aria-label={aria_label}
      >
        {children}
      </ul>
    </section>
  )
}

interface SheetStatsRowProps {
  sheet: SheetReportStats
  grand_total_ms: number
  duration_format: import('@/lib/types/ui_preferences').DurationFormat
}

/**
 * Single sheet row with duration, share, and entry count.
 */
function SheetStatsRow({
  sheet,
  grand_total_ms,
  duration_format,
}: SheetStatsRowProps) {
  const share_percent =
    grand_total_ms > 0 ? Math.round((sheet.totalMs / grand_total_ms) * 100) : 0
  const bar_percent = grand_total_ms > 0 ? (sheet.totalMs / grand_total_ms) * 100 : 0

  return (
    <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 min-w-0 truncate text-[1rem] font-semibold">{sheet.sheetName}</h2>
        <span className="shrink-0 font-mono text-[0.95rem] font-semibold text-accent">
          {format_duration(sheet.totalMs, duration_format)}
        </span>
      </div>
      <div
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-raised"
        role="presentation"
      >
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${bar_percent}%` }}
        />
      </div>
      <p className="m-0 mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[0.82rem] text-muted">
        <span>{share_percent}% of total</span>
        <span>
          {sheet.entryCount} {sheet.entryCount === 1 ? 'entry' : 'entries'}
        </span>
        <span>
          {sheet.entryCount === 0
            ? 'No average'
            : `${format_duration(sheet.averageEntryMs, duration_format)} avg`}
        </span>
        {sheet.hasActiveEntry ? <span className="text-accent">Timer running</span> : null}
      </p>
    </li>
  )
}

interface IdleSheetStatsRowProps {
  sheet: SheetReportStats
  in_range: boolean
}

/**
 * Compact row for sheets with no entries or no tracked time.
 */
function IdleSheetStatsRow({ sheet, in_range }: IdleSheetStatsRowProps) {
  const status_label = in_range
    ? 'No time in range'
    : sheet.entryCount === 0
      ? 'No entries'
      : 'No tracked time'

  return (
    <li className="rounded-md border border-dashed border-panel-border bg-surface-raised/60 px-3.5 py-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="m-0 min-w-0 truncate text-[0.95rem] font-medium text-muted">
          {sheet.sheetName}
        </h3>
        <span className="shrink-0 text-[0.82rem] text-muted">{status_label}</span>
      </div>
      {sheet.hasActiveEntry ? (
        <p className="m-0 mt-1.5 text-[0.82rem] text-accent">Timer running</p>
      ) : null}
    </li>
  )
}
