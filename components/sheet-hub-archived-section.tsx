"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { format_duration } from "@/lib/format_duration";
import { format_last_activity_label } from "@/lib/format_last_activity_label";
import { get_button_class_name } from "@/lib/get_button_class_name";
import { patch_tracker_action } from "@/lib/patch_tracker_action";
import { type SheetHubRow } from "@/lib/types/sheet_hub";
import { type DurationFormat } from "@/lib/types/ui_preferences";

interface SheetHubArchivedSectionProps {
  rows: SheetHubRow[];
  duration_format: DurationFormat;
}

/**
 * Collapsible list of archived sheets with restore actions on the Sheets hub.
 */
export function SheetHubArchivedSection({
  rows,
  duration_format,
}: Readonly<SheetHubArchivedSectionProps>) {
  const router = useRouter();
  const [is_expanded, setIs_expanded] = useState(false);
  const [pending_sheet_name, setPending_sheet_name] = useState<string | null>(
    null,
  );

  if (rows.length === 0) {
    return null;
  }

  const handle_restore = async (sheet_name: string): Promise<void> => {
    setPending_sheet_name(sheet_name);

    try {
      await patch_tracker_action("/api/sheet", {
        name: sheet_name,
        archived: false,
      });
      router.refresh();
    } finally {
      setPending_sheet_name(null);
    }
  };

  return (
    <section className="flex w-full flex-col gap-2 border-t border-panel-border pt-6">
      <button
        type="button"
        className={`${get_button_class_name("ghost")} w-full justify-between`}
        aria-expanded={is_expanded}
        onClick={() => setIs_expanded((expanded) => !expanded)}
      >
        <span>Archived sheets ({rows.length})</span>
        <span className="text-muted">{is_expanded ? "▾" : "▸"}</span>
      </button>
      {is_expanded ? (
        <ul
          className="m-0 flex list-none flex-col gap-2 p-0"
          aria-label="Archived sheets"
        >
          {rows.map((row) => (
            <li
              key={row.sheetName}
              className="rounded-md border border-panel-border bg-surface-raised p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="m-0 truncate text-[0.95rem] font-semibold text-muted">
                    {row.sheetName}
                  </h2>
                  <p className="m-0 mt-1 text-[0.82rem] text-muted">
                    {format_last_activity_label(row.lastActivityAt)} ·{" "}
                    {row.entryCount}{" "}
                    {row.entryCount === 1 ? "entry" : "entries"} ·{" "}
                    {format_duration(row.monthTotalMs, duration_format)} this
                    month
                  </p>
                </div>
                <button
                  type="button"
                  className={get_button_class_name("ghost", "small")}
                  disabled={pending_sheet_name !== null}
                  onClick={() => void handle_restore(row.sheetName)}
                >
                  {pending_sheet_name === row.sheetName
                    ? "Restoring…"
                    : "Restore"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
