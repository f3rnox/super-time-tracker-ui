"use client";

import { type ComponentProps, useState } from "react";

import { get_button_class_name } from "@/lib/get_button_class_name";
import { get_note_form_border_class } from "@/lib/get_note_form_border_class";
import { get_input_class_name } from "@/lib/get_input_class_name";
import { use_escape_to_cancel } from "@/lib/use_escape_to_cancel";

interface NoteFormProps {
  on_submit: (text: string, at?: string) => void;
  on_cancel?: () => void;
  is_pending: boolean;
  in_active_panel?: boolean;
  in_bar?: boolean;
  allow_at?: boolean;
}

/**
 * Adds a note to the active entry.
 */
export function NoteForm({
  on_submit,
  on_cancel,
  is_pending,
  in_active_panel = false,
  in_bar = false,
  allow_at = false,
}: Readonly<NoteFormProps>) {
  const [text, setText] = useState("");
  const [at, setAt] = useState("");

  use_escape_to_cancel(() => on_cancel?.(), on_cancel !== undefined);

  const handle_submit: NonNullable<ComponentProps<"form">["onSubmit"]> = (
    event,
  ) => {
    event.preventDefault();
    const trimmed = text.trim();

    if (trimmed.length === 0) {
      return;
    }

    const trimmed_at = at.trim();

    on_submit(trimmed, trimmed_at.length > 0 ? trimmed_at : undefined);
    setText("");
    setAt("");
  };

  const border_class = get_note_form_border_class(in_active_panel, in_bar);

  return (
    <form
      className={`flex flex-col gap-2 ${border_class}`}
      onSubmit={handle_submit}
    >
      <label className="text-[0.85rem] text-muted" htmlFor="note-text">
        Add note
      </label>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 max-[860px]:grid-cols-1">
        <input
          id="note-text"
          className={get_input_class_name()}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Pair with alice on the widget"
          disabled={is_pending}
          autoFocus
        />
        <div className="flex flex-wrap items-center gap-2 max-[860px]:w-full">
          <button
            type="submit"
            className={get_button_class_name("ghost")}
            disabled={is_pending || text.trim().length === 0}
          >
            Save note
          </button>
          {on_cancel === undefined ? null : (
            <button
              type="button"
              className={get_button_class_name("ghost")}
              disabled={is_pending}
              onClick={on_cancel}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      {allow_at ? (
        <>
          <label className="text-[0.85rem] text-muted" htmlFor="note-at">
            Note time{" "}
            <span className="font-normal opacity-85">
              (optional, natural language)
            </span>
          </label>
          <input
            id="note-at"
            className={get_input_class_name()}
            value={at}
            onChange={(event) => setAt(event.target.value)}
            placeholder="e.g. 30 minutes ago"
            disabled={is_pending}
          />
        </>
      ) : null}
    </form>
  );
}
