import { Checkbox } from "@/components/checkbox";
import { EntryListSortControls } from "@/components/entry-list-sort-controls";
import { format_duration } from "@/lib/format_duration";
import { format_entry_count_label } from "@/lib/format_entry_count_label";
import { get_button_class_name } from "@/lib/get_button_class_name";
import { type DurationFormat } from "@/lib/types/ui_preferences";

type EntryListIdleHeaderProps = Readonly<{
  header_extra: React.ReactNode;
  title: string;
  entries_length: number;
  all_selected: boolean;
  some_selected: boolean;
  is_pending: boolean;
  total_ms: number;
  duration_format: DurationFormat;
  archived_entry_count: number;
  show_archived_entries: boolean;
  on_toggle_show_archived: (() => void) | undefined;
  on_toggle_all: () => void;
  ai_revise_error: string | null;
}>;

/**
 * Default entry list header shown when no rows are selected.
 */
export function EntryListIdleHeader({
  header_extra,
  title,
  entries_length,
  all_selected,
  some_selected,
  is_pending,
  total_ms,
  duration_format,
  archived_entry_count,
  show_archived_entries,
  on_toggle_show_archived,
  on_toggle_all,
  ai_revise_error,
}: EntryListIdleHeaderProps) {
  return (
    <>
      {header_extra}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2">
          {entries_length > 0 ? (
            <Checkbox
              className="shrink-0"
              checked={all_selected}
              indeterminate={some_selected}
              disabled={is_pending}
              aria_label="Select all entries"
              on_change={on_toggle_all}
            />
          ) : null}
          <h2 className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em]">
            {title}
          </h2>
          <span className="text-[0.8rem] text-muted">
            {format_entry_count_label(entries_length)}
          </span>
        </div>
        <p className="m-0 font-mono text-[0.85rem] text-muted max-[640px]:w-full">
          {format_duration(total_ms, duration_format)} total
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <EntryListSortControls is_pending={is_pending} />
        {archived_entry_count > 0 && on_toggle_show_archived !== undefined ? (
          <button
            type="button"
            className={get_button_class_name("ghost", "small")}
            disabled={is_pending}
            onClick={on_toggle_show_archived}
          >
            {show_archived_entries
              ? "Hide archived"
              : `Show archived (${archived_entry_count})`}
          </button>
        ) : null}
      </div>
      {ai_revise_error === null ? null : (
        <p className="m-0 text-[0.8rem] text-danger">{ai_revise_error}</p>
      )}
    </>
  );
}
