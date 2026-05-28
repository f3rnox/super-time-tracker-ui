"use client";

import Link from "next/link";

import { format_last_activity_label } from "@/lib/format_last_activity_label";
import { format_duration } from "@/lib/format_duration";
import { navigate_to_tracker_sheet } from "@/lib/navigate_to_tracker_sheet";
import { type SheetHubRow } from "@/lib/types/sheet_hub";
import { type DurationFormat } from "@/lib/types/ui_preferences";

interface SheetHubRowCardProps {
  row: SheetHubRow;
  duration_format: DurationFormat;
  is_pinned: boolean;
  on_toggle_pin: () => void;
}

/**
 * Single sheet summary card for the sheet hub.
 */
export function SheetHubRowCard({
  row,
  duration_format,
  is_pinned,
  on_toggle_pin,
}: Readonly<SheetHubRowCardProps>) {
  const last_activity = format_last_activity_label(row.lastActivityAt);

  return (
    <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="m-0 min-w-0 truncate text-[1rem] font-semibold">
              {row.sheetName}
            </h2>
            {row.hasActiveEntry ? (
              <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[0.68rem] font-bold uppercase leading-none tracking-wider text-accent-text-on">
                Tracking
              </span>
            ) : null}
          </div>
          <p className="m-0 mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[0.82rem] text-muted">
            <span>{last_activity}</span>
            <span>
              {row.entryCount} {row.entryCount === 1 ? "entry" : "entries"}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="cursor-pointer rounded-md border-0 bg-transparent px-2 py-1 text-[0.9rem] text-muted hover:bg-surface-hover hover:text-foreground"
            aria-pressed={is_pinned}
            aria-label={
              is_pinned ? `Unpin ${row.sheetName}` : `Pin ${row.sheetName}`
            }
            onClick={on_toggle_pin}
          >
            {is_pinned ? "★" : "☆"}
          </button>
          <Link
            href="/"
            className="rounded-md px-2.5 py-1 text-[0.82rem] font-semibold text-accent no-underline hover:bg-accent-soft"
            onClick={() => navigate_to_tracker_sheet(row.sheetName)}
          >
            Open
          </Link>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-md bg-surface-raised px-2.5 py-2">
          <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-muted">
            This week
          </p>
          <p className="m-0 mt-0.5 font-mono text-[0.9rem] font-semibold text-accent">
            {format_duration(row.weekTotalMs, duration_format)}
          </p>
        </div>
        <div className="rounded-md bg-surface-raised px-2.5 py-2">
          <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-muted">
            This month
          </p>
          <p className="m-0 mt-0.5 font-mono text-[0.9rem] font-semibold text-accent">
            {format_duration(row.monthTotalMs, duration_format)}
          </p>
        </div>
      </div>
    </li>
  );
}
