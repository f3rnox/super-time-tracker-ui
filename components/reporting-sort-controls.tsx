"use client";

import { get_button_class_name } from "@/lib/get_button_class_name";
import { type SheetReportSort } from "@/lib/types/reporting";

interface ReportingSortControlsProps {
  sort: SheetReportSort;
  on_sort_change: (sort: SheetReportSort) => void;
}

const sort_options: { value: SheetReportSort; label: string }[] = [
  { value: "duration", label: "Duration" },
  { value: "name", label: "Name" },
  { value: "entry_count", label: "Entries" },
  { value: "active_first", label: "Active first" },
];

/**
 * Sort mode toggles for the reporting sheet lists.
 */
export function ReportingSortControls({
  sort,
  on_sort_change,
}: Readonly<ReportingSortControlsProps>) {
  return (
    <fieldset className="m-0 flex w-full max-w-2xl flex-col gap-2 border-0 p-0">
      <legend className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
        Sort by
      </legend>
      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label="Sort sheets by"
      >
        {sort_options.map((option) => {
          const is_selected = sort === option.value;

          return (
            <button
              key={option.value}
              type="button"
              className={`${get_button_class_name("ghost", "small")} ${
                is_selected
                  ? "border-accent-border bg-accent-soft text-foreground"
                  : ""
              }`}
              aria-pressed={is_selected}
              onClick={() => on_sort_change(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
