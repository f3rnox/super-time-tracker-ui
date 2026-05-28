"use client";

import { format_duration } from "@/lib/format_duration";
import { type MonthInReviewStats } from "@/lib/types/reporting";
import { type DurationFormat } from "@/lib/types/ui_preferences";

interface ReportingMonthInReviewProps {
  stats: MonthInReviewStats;
  duration_format: DurationFormat;
}

/**
 * 'Month in review' style summary showcasing headline stats for the current month.
 */
export function ReportingMonthInReview({
  stats,
  duration_format,
}: Readonly<ReportingMonthInReviewProps>) {
  const tracked_ratio =
    stats.daysInMonth > 0 ? stats.trackedDays / stats.daysInMonth : 0;
  const tracked_pct = Math.round(tracked_ratio * 100);

  return (
    <section
      className="flex w-full flex-col gap-5 rounded-md border border-panel-border bg-panel p-5 shadow-sm"
      aria-label="Month in review"
      style={{
        backgroundImage:
          "linear-gradient(135deg, color-mix(in srgb, var(--accent-soft) 60%, transparent) 0%, transparent 70%)",
      }}
    >
      <header className="flex flex-col gap-1">
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-accent">
          Month in review
        </span>
        <h2 className="m-0 text-[1.25rem] font-[650] tracking-tight">
          {stats.monthLabel}
        </h2>
        <p className="m-0 text-[0.85rem] text-muted">
          {stats.totalMs === 0
            ? "No time tracked this month yet — start a timer to fill this in."
            : `Tracked on ${stats.trackedDays} of ${stats.daysInMonth} days (${tracked_pct}%).`}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Highlight
          label="Total this month"
          value={format_duration(stats.totalMs, duration_format)}
          detail={
            stats.totalMs === 0
              ? "—"
              : `${format_duration(stats.averageActiveDayMs, duration_format)} per active day`
          }
        />
        <Highlight
          label="Best day"
          value={
            stats.bestDayMs === 0
              ? "—"
              : format_duration(stats.bestDayMs, duration_format)
          }
          detail={stats.bestDayLabel ?? "No tracked days yet"}
        />
        <Highlight
          label="Top sheet"
          value={stats.topSheetName ?? "—"}
          detail={
            stats.topSheetMs === 0
              ? "No tracked sheets"
              : format_duration(stats.topSheetMs, duration_format)
          }
        />
        <Highlight
          label="Top tag"
          value={stats.topTag ?? "—"}
          detail={
            stats.topTagMs === 0
              ? "Tag entries to surface"
              : format_duration(stats.topTagMs, duration_format)
          }
        />
      </div>

      <ul className="m-0 grid grid-cols-1 gap-2 p-0 text-[0.85rem] sm:grid-cols-3">
        <FactRow
          label="Current streak"
          value={`${stats.currentStreakDays} day${stats.currentStreakDays === 1 ? "" : "s"}`}
        />
        <FactRow
          label="Longest streak"
          value={`${stats.longestStreakDays} day${stats.longestStreakDays === 1 ? "" : "s"}`}
        />
        <FactRow
          label="Longest entry"
          value={
            stats.longestEntryMs === 0
              ? "—"
              : format_duration(stats.longestEntryMs, duration_format)
          }
        />
        <FactRow label="Entries logged" value={String(stats.totalEntries)} />
        <FactRow
          label="Tracked days"
          value={`${stats.trackedDays} / ${stats.daysInMonth}`}
        />
        <FactRow label="Coverage" value={`${tracked_pct}%`} />
      </ul>
    </section>
  );
}

/**
 * Single highlight cell used at the top of the month-in-review card.
 */
function Highlight({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-panel-border bg-surface-raised/60 p-3.5">
      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.06em] text-muted">
        {label}
      </span>
      <span className="truncate font-mono text-[1.05rem] font-semibold">
        {value}
      </span>
      <span className="text-[0.78rem] text-muted">{detail}</span>
    </div>
  );
}

/**
 * Two-column fact row used in the month-in-review supporting list.
 */
function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-md border border-panel-border/60 bg-surface-raised/40 px-3 py-2">
      <span className="text-[0.78rem] text-muted">{label}</span>
      <span className="font-mono font-semibold">{value}</span>
    </li>
  );
}
