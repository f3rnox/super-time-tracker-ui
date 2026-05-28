"use client";

import { useMemo, useSyncExternalStore } from "react";

import { SheetHubRowCard } from "@/components/sheet-hub-row";
import { TrackerTopbar } from "@/components/tracker-topbar";
import {
  get_pinned_sheet_names_server_snapshot,
  get_pinned_sheet_names_snapshot,
  subscribe_pinned_sheet_names,
} from "@/lib/pinned_sheet_names_store";
import { sort_sheet_hub_rows } from "@/lib/sort_sheet_hub_rows";
import { toggle_pinned_sheet_name } from "@/lib/toggle_pinned_sheet_name";
import { use_duration_format } from "@/lib/use_duration_format";
import { type SheetHubRow } from "@/lib/types/sheet_hub";

interface SheetHubViewProps {
  rows: SheetHubRow[];
}

/**
 * Projects overview with per-sheet week/month totals and pin controls.
 */
export function SheetHubView({ rows }: Readonly<SheetHubViewProps>) {
  const duration_format = use_duration_format();
  const pinned_names = useSyncExternalStore(
    subscribe_pinned_sheet_names,
    get_pinned_sheet_names_snapshot,
    get_pinned_sheet_names_server_snapshot,
  );
  const pinned_set = new Set(pinned_names);
  const sorted_rows = useMemo(() => sort_sheet_hub_rows(rows), [rows]);

  return (
    <>
      <TrackerTopbar breadcrumb={{ current: "Sheets" }} />
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-5 pb-12 pt-6">
        <header className="flex w-full flex-col gap-2 text-center">
          <h1 className="m-0 text-[1.5rem] font-[650] tracking-tight">
            Sheets
          </h1>
          <p className="m-0 text-[0.9rem] leading-relaxed text-muted">
            Quick overview of every project. Pin sheets to filter the Today
            view.
          </p>
        </header>

        {sorted_rows.length === 0 ? (
          <p className="m-0 text-center text-[0.9rem] text-muted">
            No sheets yet. Create one from the tracker.
          </p>
        ) : (
          <ul
            className="m-0 flex w-full list-none flex-col gap-2 p-0"
            aria-label="Sheet summaries"
          >
            {sorted_rows.map((row) => (
              <SheetHubRowCard
                key={row.sheetName}
                row={row}
                duration_format={duration_format}
                is_pinned={pinned_set.has(row.sheetName)}
                on_toggle_pin={() => toggle_pinned_sheet_name(row.sheetName)}
              />
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
