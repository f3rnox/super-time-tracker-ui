"use client";

import { type ComponentProps, useEffect, useRef, useState } from "react";

import { format_display_tag } from "@/lib/format_display_tag";
import { format_duration } from "@/lib/format_duration";
import { get_button_class_name } from "@/lib/get_button_class_name";
import { get_input_class_name } from "@/lib/get_input_class_name";
import { type CheckOutOptions } from "@/lib/types/check_out_options";
import { type SerializedEntry } from "@/lib/types/tracker_state";
import { use_duration_format } from "@/lib/use_duration_format";
import { use_escape_to_cancel } from "@/lib/use_escape_to_cancel";
import { use_timer_show_seconds } from "@/lib/use_timer_show_seconds";

interface ActiveEntryCheckoutFormProps {
  entry: SerializedEntry;
  in_bar: boolean;
  is_pending: boolean;
  initial_at?: string;
  on_cancel: () => void;
  on_submit: (options: CheckOutOptions | undefined) => void;
}

const tag_item_class =
  "rounded-full bg-tag-bg px-2 py-0.5 text-[0.72rem] text-tag-text";

/**
 * Inline checkout form shown inside the active entry panel during checkout.
 */
export function ActiveEntryCheckoutForm({
  entry,
  in_bar,
  is_pending,
  initial_at,
  on_cancel,
  on_submit,
}: Readonly<ActiveEntryCheckoutFormProps>) {
  const duration_format = use_duration_format();
  const show_seconds = use_timer_show_seconds();
  const [duration_ms, setDuration_ms] = useState(
    () => Date.now() - new Date(entry.start).getTime(),
  );
  const [note, setNote] = useState("");
  const [at, setAt] = useState(initial_at ?? "");
  const note_input_ref = useRef<HTMLInputElement>(null);

  use_escape_to_cancel(on_cancel);

  useEffect(() => {
    note_input_ref.current?.focus();
  }, []);

  useEffect(() => {
    setDuration_ms(Date.now() - new Date(entry.start).getTime());

    const interval = globalThis.setInterval(() => {
      setDuration_ms(Date.now() - new Date(entry.start).getTime());
    }, 1000);

    return () => globalThis.clearInterval(interval);
  }, [entry.start]);

  const handle_submit: NonNullable<ComponentProps<"form">["onSubmit"]> = (
    event,
  ) => {
    event.preventDefault();

    const trimmed_note = note.trim();
    const trimmed_at = at.trim();
    const has_note = trimmed_note.length > 0;
    const has_at = trimmed_at.length > 0;

    if (!has_note && !has_at) {
      on_submit(undefined);
      return;
    }

    on_submit({
      ...(has_at ? { at: trimmed_at } : {}),
      ...(has_note ? { note: trimmed_note } : {}),
    });
  };

  const duration_text = format_duration(
    duration_ms,
    duration_format,
    show_seconds,
  );
  const description_text = entry.description || "Untitled entry";

  return (
    <form
      className="flex min-w-0 flex-col gap-4"
      aria-label="Check out form"
      onSubmit={handle_submit}
    >
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-[0.68rem] font-bold uppercase leading-none tracking-wider text-danger">
            Checking out
          </span>
          <h2 className="m-0 min-w-0 truncate text-[1.05rem] font-[650] leading-tight tracking-tight min-[560px]:text-[1.15rem]">
            {description_text}
          </h2>
        </div>
        <p className="m-0 whitespace-nowrap font-mono text-[1.4rem] font-medium leading-none tracking-tight text-accent min-[560px]:text-[1.6rem]">
          {duration_text}
        </p>
      </div>

      {entry.tags.length > 0 ? (
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {entry.tags.map((tag) => (
            <li key={tag} className={tag_item_class}>
              {format_display_tag(tag)}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid grid-cols-1 gap-3 min-[640px]:grid-cols-[minmax(0,1fr)_minmax(10rem,14rem)]">
        <label className="flex min-w-0 flex-col gap-1" htmlFor="checkout-note">
          <span className="text-[0.8rem] font-semibold">
            Note <span className="font-normal text-muted">(optional)</span>
          </span>
          <input
            ref={note_input_ref}
            id="checkout-note"
            className={get_input_class_name("compact")}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Wrap-up, blockers, next steps…"
            disabled={is_pending}
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1" htmlFor="checkout-at">
          <span className="text-[0.8rem] font-semibold">
            End time <span className="font-normal text-muted">(optional)</span>
          </span>
          <input
            id="checkout-at"
            className={get_input_class_name("compact")}
            value={at}
            onChange={(event) => setAt(event.target.value)}
            placeholder="e.g. now, 30 minutes ago, 5:30pm"
            disabled={is_pending}
          />
        </label>
      </div>

      <div
        className={`flex flex-wrap items-center gap-2 ${in_bar ? "" : "pt-1"}`}
      >
        <button
          type="submit"
          className={get_button_class_name("danger-solid")}
          disabled={is_pending}
        >
          Confirm check out
        </button>
        <button
          type="button"
          className={get_button_class_name("ghost")}
          disabled={is_pending}
          onClick={on_cancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
