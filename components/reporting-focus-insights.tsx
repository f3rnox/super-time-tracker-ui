"use client";

import { type ReactNode } from "react";

import { format_duration } from "@/lib/format_duration";
import { type FocusPatternInsights } from "@/lib/types/reporting";
import { type DurationFormat } from "@/lib/types/ui_preferences";

interface ReportingFocusInsightsProps {
  insights: FocusPatternInsights;
  duration_format: DurationFormat;
}

/**
 * Interpretive focus-pattern summary built from reporting entries.
 */
export function ReportingFocusInsights({
  insights,
  duration_format,
}: Readonly<ReportingFocusInsightsProps>) {
  return (
    <section className="flex w-full flex-col gap-4 rounded-md border border-panel-border bg-panel p-4 shadow-sm">
      <header className="flex flex-col gap-0.5">
        <h3 className="m-0 text-[0.95rem] font-semibold">
          Focus pattern insights
        </h3>
        <p className="m-0 text-[0.78rem] text-muted">
          Heuristics from starts, gaps, sheet changes, and long focus blocks.
        </p>
      </header>

      {insights.activeDayCount === 0 ? (
        <p className="m-0 py-4 text-center text-[0.85rem] text-muted">
          No tracked time in this period.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <MetricTile
              label="Interruptions"
              value={String(insights.interruptionCount)}
              detail={`${format_rate(insights.interruptionFrequencyPerDay)} / active day`}
            />
            <MetricTile
              label="Context switches"
              value={String(insights.contextSwitchCount)}
              detail={`${format_rate(insights.contextSwitchesPerDay)} / active day`}
            />
            <MetricTile
              label="Deep-work streak"
              value={
                insights.longestDeepWorkStreakMs > 0
                  ? format_duration(
                      insights.longestDeepWorkStreakMs,
                      duration_format,
                    )
                  : "None"
              }
              detail={
                insights.longestDeepWorkStreakEntryCount > 0
                  ? `${insights.longestDeepWorkStreakEntryCount} focused entries`
                  : `${format_duration(insights.deepWorkThresholdMs, duration_format)}+ entries`
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <InsightList title="Best focus hours">
              {insights.bestFocusHours.length === 0 ? (
                <EmptyItem label="No strong focus hour yet." />
              ) : (
                insights.bestFocusHours.map((hour) => (
                  <InsightItem
                    key={hour.hourIndex}
                    label={hour.hourLabel}
                    value={format_duration(hour.totalMs, duration_format)}
                    detail={`${hour.entryCount} touched entries`}
                  />
                ))
              )}
            </InsightList>

            <InsightList title="Recurring idle windows">
              {insights.recurringIdleWindows.length === 0 ? (
                <EmptyItem label="No recurring idle window found." />
              ) : (
                insights.recurringIdleWindows.map((window) => (
                  <InsightItem
                    key={window.hourIndex}
                    label={window.hourLabel}
                    value={`${window.dayCount} days`}
                    detail={`${format_duration(
                      window.totalIdleMs,
                      duration_format,
                    )} idle`}
                  />
                ))
              )}
            </InsightList>
          </div>

          <InsightList title="Usual project starts">
            {insights.sheetStartSuggestions.length === 0 ? (
              <EmptyItem label="Not enough repeated project starts yet." />
            ) : (
              insights.sheetStartSuggestions.map((suggestion) => (
                <InsightItem
                  key={`${suggestion.sheetName}-${suggestion.hourIndex}`}
                  label={`You usually start ${suggestion.sheetName} around ${suggestion.hourLabel}`}
                  value={`${Math.round(suggestion.confidence * 100)}%`}
                  detail={`${suggestion.startCount} starts in this hour`}
                />
              ))
            )}
          </InsightList>
        </>
      )}
    </section>
  );
}

function MetricTile({
  label,
  value,
  detail,
}: Readonly<{ label: string; value: string; detail: string }>) {
  return (
    <article className="rounded-md border border-panel-border bg-background p-3">
      <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-muted">
        {label}
      </p>
      <p className="m-0 mt-1 font-mono text-[1.05rem] font-semibold text-accent">
        {value}
      </p>
      <p className="m-0 mt-1 text-[0.78rem] text-muted">{detail}</p>
    </article>
  );
}

function InsightList({
  title,
  children,
}: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <section className="rounded-md border border-panel-border bg-background p-3">
      <h4 className="m-0 text-[0.82rem] font-semibold">{title}</h4>
      <ul className="m-0 mt-2 flex list-none flex-col gap-2 p-0">{children}</ul>
    </section>
  );
}

function InsightItem({
  label,
  value,
  detail,
}: Readonly<{ label: string; value: string; detail: string }>) {
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[0.82rem]">
      <span className="min-w-0 font-medium">{label}</span>
      <span className="font-mono font-semibold text-accent">{value}</span>
      <span className="basis-full text-[0.76rem] text-muted">{detail}</span>
    </li>
  );
}

function EmptyItem({ label }: Readonly<{ label: string }>) {
  return <li className="text-[0.82rem] text-muted">{label}</li>;
}

function format_rate(value: number): string {
  if (value === 0) {
    return "0";
  }

  return value < 10 ? value.toFixed(1) : value.toFixed(0);
}
