"use client";

import { useMemo } from "react";

import { format_duration } from "@/lib/format_duration";
import { round_chart_percent } from "@/lib/round_chart_percent";
import { type WeekdayTimeStat } from "@/lib/types/reporting";
import { type DurationFormat } from "@/lib/types/ui_preferences";

interface ReportingWeekdayBarsProps {
  weekday_distribution: WeekdayTimeStat[];
  duration_format: DurationFormat;
}

/**
 * Horizontal bar chart comparing time tracked across days of the week.
 */
export function ReportingWeekdayBars({
  weekday_distribution,
  duration_format,
}: Readonly<ReportingWeekdayBarsProps>) {
  const max_ms = useMemo(
    () =>
      weekday_distribution.reduce(
        (max, stat) => Math.max(max, stat.totalMs),
        0,
      ),
    [weekday_distribution],
  );
  const total_ms = useMemo(
    () => weekday_distribution.reduce((total, stat) => total + stat.totalMs, 0),
    [weekday_distribution],
  );

  return (
    <section className="flex w-full flex-col gap-3 rounded-md border border-panel-border bg-panel p-4 shadow-sm">
      <header className="flex flex-col gap-0.5">
        <h3 className="m-0 text-[0.95rem] font-semibold">Day of week</h3>
        <p className="m-0 text-[0.78rem] text-muted">
          Where your week tends to lean.
        </p>
      </header>
      {total_ms === 0 ? (
        <p className="m-0 py-4 text-center text-[0.85rem] text-muted">
          No tracked time in this period.
        </p>
      ) : (
        <ul className="m-0 flex flex-col gap-1.5 p-0">
          {weekday_distribution.map((stat) => {
            const width_percent =
              max_ms > 0
                ? round_chart_percent((stat.totalMs / max_ms) * 100)
                : 0;

            return (
              <li
                key={stat.weekdayIndex}
                className="grid grid-cols-[2.25rem_1fr_auto] items-center gap-2 text-[0.82rem]"
              >
                <span className="font-mono text-[0.78rem] text-muted">
                  {stat.weekdayLabel}
                </span>
                <span
                  className="block h-2 overflow-hidden rounded-full bg-surface-raised"
                  role="presentation"
                >
                  <span
                    className="block h-full rounded-full bg-accent"
                    style={{
                      width: `${Math.max(width_percent, stat.totalMs > 0 ? 4 : 0)}%`,
                    }}
                  />
                </span>
                <span className="font-mono text-foreground">
                  {format_duration(stat.totalMs, duration_format)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
