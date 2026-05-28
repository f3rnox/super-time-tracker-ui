"use client";

import { type ComponentProps, useEffect, useMemo, useState } from "react";

import { format_datetime_hint } from "@/components/format_datetime_hint";
import { TagAutocompleteInput } from "@/components/tag-autocomplete-input";
import { build_resume_description } from "@/lib/build_resume_description";
import { get_button_class_name } from "@/lib/get_button_class_name";
import { get_input_class_name } from "@/lib/get_input_class_name";
import { use_escape_to_cancel } from "@/lib/use_escape_to_cancel";
import { type SerializedEntry } from "@/lib/types/tracker_state";

export interface EntryEditFormValues {
  description?: string;
  start?: string;
  end?: string;
}

interface EntryEditFormProps {
  entry: SerializedEntry;
  known_tags: string[];
  is_pending: boolean;
  initial_description_override?: string;
  in_active_panel?: boolean;
  times_only?: boolean;
  start_only?: boolean;
  on_save: (values: EntryEditFormValues) => void;
  on_cancel: () => void;
}

/**
 * Form for editing an entry description, tags, and optional start/end times.
 */
export function EntryEditForm({
  entry,
  known_tags,
  is_pending,
  initial_description_override,
  in_active_panel = false,
  times_only = false,
  start_only = false,
  on_save,
  on_cancel,
}: Readonly<EntryEditFormProps>) {
  const initial_description = useMemo(
    () =>
      initial_description_override ??
      build_resume_description(entry.description, entry.tags),
    [entry.description, entry.tags, initial_description_override],
  );
  const [description, setDescription] = useState(initial_description);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(() => {
    setDescription(
      initial_description_override ??
        build_resume_description(entry.description, entry.tags),
    );
    setStart("");
    setEnd("");
  }, [
    entry.description,
    entry.id,
    entry.sheetName,
    entry.tags,
    initial_description_override,
  ]);

  use_escape_to_cancel(on_cancel);

  const handle_submit: NonNullable<ComponentProps<"form">["onSubmit"]> = (
    event,
  ) => {
    event.preventDefault();

    const trimmed_description = description.trim();
    const trimmed_start = start.trim();
    const trimmed_end = end.trim();
    const values: EntryEditFormValues = {};

    if (!times_only && trimmed_description !== initial_description.trim()) {
      values.description = trimmed_description;
    }

    if (trimmed_start.length > 0) {
      values.start = trimmed_start;
    }

    if (!start_only && trimmed_end.length > 0) {
      values.end = trimmed_end;
    }

    if (
      values.description === undefined &&
      values.start === undefined &&
      values.end === undefined
    ) {
      return;
    }

    on_save(values);
  };

  const end_hint = entry.isActive
    ? "still running"
    : format_datetime_hint(entry.end ?? entry.start);

  const has_changes = times_only
    ? start.trim().length > 0 || (!start_only && end.trim().length > 0)
    : description.trim() !== initial_description.trim() ||
      start.trim().length > 0 ||
      (!start_only && end.trim().length > 0);

  return (
    <form
      className={`flex flex-col gap-3 rounded-[0.65rem] border border-panel-border bg-input-bg p-3 ${in_active_panel ? "mt-2" : ""}`}
      onSubmit={handle_submit}
    >
      <p className="m-0 text-[0.85rem] font-semibold">
        {times_only ? "Edit times" : "Edit entry"}
      </p>
      {times_only ? null : (
        <label
          className="flex flex-col gap-1"
          htmlFor={`entry-description-${entry.id}`}
        >
          <span className="text-[0.8rem] font-semibold">Description</span>
          <TagAutocompleteInput
            id={`entry-description-${entry.id}`}
            value={description}
            known_tags={known_tags}
            placeholder="e.g. crafting something @design"
            disabled={is_pending}
            autoFocus={in_active_panel}
            on_change={setDescription}
          />
        </label>
      )}
      <div className="flex flex-col gap-2">
        <p className="m-0 text-[0.8rem] font-semibold text-muted">
          Times (optional)
        </p>
        <div
          className={`grid gap-2.5 max-[860px]:grid-cols-1 ${
            start_only ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          <label
            className="flex flex-col gap-1"
            htmlFor={`entry-start-${entry.id}`}
          >
            <span className="text-[0.8rem] font-semibold">Start</span>
            <span className="text-[0.72rem] text-muted">
              Current: {format_datetime_hint(entry.start)}
            </span>
            <input
              id={`entry-start-${entry.id}`}
              className={get_input_class_name("compact")}
              value={start}
              onChange={(event) => setStart(event.target.value)}
              placeholder="e.g. 10am, 30 minutes ago"
              disabled={is_pending}
              autoFocus={times_only && in_active_panel}
            />
          </label>
          {start_only ? null : (
            <label
              className="flex flex-col gap-1"
              htmlFor={`entry-end-${entry.id}`}
            >
              <span className="text-[0.8rem] font-semibold">End</span>
              <span className="text-[0.72rem] text-muted">
                Current: {end_hint}
              </span>
              <input
                id={`entry-end-${entry.id}`}
                className={get_input_class_name("compact")}
                value={end}
                onChange={(event) => setEnd(event.target.value)}
                placeholder={
                  entry.isActive ? "e.g. now, 5 minutes ago" : "e.g. 11:30am"
                }
                disabled={is_pending}
              />
            </label>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className={get_button_class_name("primary", "small")}
          disabled={is_pending || !has_changes}
        >
          Save
        </button>
        <button
          type="button"
          className={get_button_class_name("ghost", "small")}
          disabled={is_pending}
          onClick={on_cancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
