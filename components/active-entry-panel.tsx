"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import { ActiveEntryCheckoutForm } from "@/components/active-entry-checkout-form";
import { ActiveEntryDescriptionInline } from "@/components/active-entry-description-inline";
import { CheckoutButtonGroup } from "@/components/checkout-button-group";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { EntryActionsMenu } from "@/components/entry-actions-menu";
import {
  EntryEditForm,
  type EntryEditFormValues,
} from "@/components/entry-edit-form";
import { EntryNotesList } from "@/components/entry-notes-list";
import { NoteForm } from "@/components/note-form";
import { PencilIcon } from "@/components/pencil-icon";
import { format_display_tag } from "@/lib/format_display_tag";
import { format_duration } from "@/lib/format_duration";
import { use_confirm_before_checkout } from "@/lib/use_confirm_before_checkout";
import { use_confirm_destructive_actions } from "@/lib/use_confirm_destructive_actions";
import { use_duration_format } from "@/lib/use_duration_format";
import { use_timer_show_seconds } from "@/lib/use_timer_show_seconds";
import { get_button_class_name } from "@/lib/get_button_class_name";
import { get_check_out_confirm_dialog } from "@/lib/get_check_out_confirm_dialog";
import { get_delete_entry_confirm_dialog } from "@/lib/get_delete_entry_confirm_dialog";
import { get_delete_note_confirm_dialog } from "@/lib/get_delete_note_confirm_dialog";
import { get_active_panel_class_name } from "@/lib/get_active_panel_class_name";
import { type CheckOutOptions } from "@/lib/types/check_out_options";
import {
  type SerializedEntry,
  type SerializedSheet,
} from "@/lib/types/tracker_state";

export interface ActiveEntryPanelHandle {
  start_edit: () => void;
  start_add_note: () => void;
}

interface ActiveEntryPanelProps {
  entry: SerializedEntry;
  sheets: SerializedSheet[];
  known_tags: string[];
  in_bar?: boolean;
  on_check_out: (options?: CheckOutOptions) => void;
  on_delete: () => void;
  on_edit: (values: EntryEditFormValues) => void;
  on_move: (target_sheet_name: string) => void;
  on_add_note: (text: string, at?: string) => void;
  on_edit_note: (timestamp: string, text: string) => void;
  on_delete_note: (timestamp: string) => void;
  is_pending: boolean;
}

const tag_item_class =
  "rounded-full bg-tag-bg px-2 py-0.5 text-xs text-tag-text";

const description_edit_button_class =
  "inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[0.35rem] border-0 bg-transparent p-0 text-muted hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-55";

/**
 * Shows the running active entry with a live duration timer.
 */
export const ActiveEntryPanel = forwardRef<
  ActiveEntryPanelHandle,
  ActiveEntryPanelProps
>(function ActiveEntryPanel(
  {
    entry,
    sheets,
    known_tags,
    in_bar = false,
    on_check_out,
    on_delete,
    on_edit,
    on_move,
    on_add_note,
    on_edit_note,
    on_delete_note,
    is_pending,
  },
  ref,
) {
  const { confirm } = useConfirmDialog();
  const confirm_destructive_actions = use_confirm_destructive_actions();
  const confirm_before_checkout = use_confirm_before_checkout();
  const duration_format = use_duration_format();
  const show_seconds = use_timer_show_seconds();
  const [duration_ms, setDuration_ms] = useState(entry.durationMs);
  const [is_editing_description, setIs_editing_description] = useState(false);
  const [is_editing_times, setIs_editing_times] = useState(false);
  const [is_adding_note, setIs_adding_note] = useState(false);
  const [is_checking_out, setIs_checking_out] = useState(false);
  const [checkout_initial_at, setCheckout_initial_at] = useState<
    string | undefined
  >(undefined);

  useImperativeHandle(
    ref,
    () => ({
      start_edit: () => {
        if (!is_editing_description && !is_editing_times && !is_checking_out) {
          setIs_editing_description(true);
        }
      },
      start_add_note: () => {
        if (
          !is_editing_description &&
          !is_editing_times &&
          !is_adding_note &&
          !is_checking_out
        ) {
          setIs_adding_note(true);
        }
      },
    }),
    [is_adding_note, is_editing_description, is_editing_times, is_checking_out],
  );

  useEffect(() => {
    setIs_adding_note(false);
    setIs_editing_description(false);
    setIs_editing_times(false);
    setIs_checking_out(false);
    setCheckout_initial_at(undefined);
  }, [entry.id, entry.sheetName]);

  useEffect(() => {
    setDuration_ms(entry.durationMs);

    const interval = globalThis.setInterval(() => {
      setDuration_ms(Date.now() - new Date(entry.start).getTime());
    }, 1000);

    return () => globalThis.clearInterval(interval);
  }, [entry.durationMs, entry.start]);

  const cancel_checkout = (): void => {
    setIs_checking_out(false);
    setCheckout_initial_at(undefined);
  };

  const start_checkout = (at?: string): void => {
    if (is_pending) {
      return;
    }

    setIs_editing_description(false);
    setIs_editing_times(false);
    setIs_adding_note(false);
    setCheckout_initial_at(at);
    setIs_checking_out(true);
  };

  const submit_checkout = async (options?: CheckOutOptions): Promise<void> => {
    if (confirm_before_checkout) {
      const confirmed = await confirm(get_check_out_confirm_dialog(options));

      if (!confirmed) {
        return;
      }
    }

    on_check_out(options);
    cancel_checkout();
  };

  const is_panel_editing =
    is_editing_description || is_editing_times || is_checking_out;
  const panel_class = get_active_panel_class_name(in_bar, is_panel_editing);

  const handle_delete_note = async (timestamp: string): Promise<void> => {
    const note = entry.notes.find((item) => item.timestamp === timestamp);
    const confirmed = confirm_destructive_actions
      ? await confirm(get_delete_note_confirm_dialog(note?.text ?? ""))
      : true;

    if (confirmed) {
      on_delete_note(timestamp);
    }
  };

  const actions_menu = (
    <EntryActionsMenu
      current_sheet_name={entry.sheetName}
      sheets={sheets}
      is_pending={is_pending}
      on_edit={() => setIs_editing_times(true)}
      on_show_add_note_form={() => setIs_adding_note(true)}
      on_move={on_move}
      on_delete={async () => {
        const confirmed = confirm_destructive_actions
          ? await confirm(get_delete_entry_confirm_dialog(entry))
          : true;

        if (confirmed) {
          on_delete();
        }
      }}
    />
  );

  if (is_checking_out) {
    return (
      <section className={panel_class} aria-label="Check out active entry">
        <ActiveEntryCheckoutForm
          entry={entry}
          in_bar={in_bar}
          is_pending={is_pending}
          initial_at={checkout_initial_at}
          on_cancel={cancel_checkout}
          on_submit={(options) => {
            void submit_checkout(options);
          }}
        />
      </section>
    );
  }

  if (is_editing_times) {
    return (
      <section className={panel_class}>
        <EntryEditForm
          entry={entry}
          known_tags={known_tags}
          is_pending={is_pending}
          in_active_panel
          times_only
          start_only
          on_cancel={() => setIs_editing_times(false)}
          on_save={(values) => {
            on_edit(values);
            setIs_editing_times(false);
          }}
        />
      </section>
    );
  }

  return (
    <section className={panel_class}>
      <div className="flex min-w-0 shrink-0 items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {in_bar ? null : (
            <span className="self-start rounded-full bg-accent px-2 py-0.5 text-[0.68rem] font-bold uppercase leading-none tracking-wider text-accent-text-on">
              Tracking
            </span>
          )}
          {is_editing_description ? (
            <ActiveEntryDescriptionInline
              entry={entry}
              known_tags={known_tags}
              is_pending={is_pending}
              on_cancel={() => setIs_editing_description(false)}
              on_save={(description) => {
                on_edit({ description });
                setIs_editing_description(false);
              }}
            />
          ) : (
            <div className="flex min-w-0 items-center gap-1">
              <h2 className="m-0 min-w-0 truncate text-[1.12rem] font-[650] leading-tight tracking-tight min-[560px]:text-xl">
                {entry.description || "Untitled entry"}
              </h2>
              <button
                type="button"
                className={description_edit_button_class}
                aria-label="Edit description"
                title="Edit description"
                disabled={is_pending || is_adding_note}
                onClick={() => setIs_editing_description(true)}
              >
                <PencilIcon />
              </button>
            </div>
          )}
        </div>
        {in_bar ? null : (
          <div className="max-[560px]:self-end">{actions_menu}</div>
        )}
      </div>
      <div
        className={`flex shrink-0 items-end justify-between gap-4 max-[860px]:flex-col max-[860px]:items-stretch ${
          in_bar ? "px-3" : ""
        }`}
      >
        <div className="flex min-w-0 flex-col gap-2">
          <p className="m-0 whitespace-nowrap font-mono text-[1.65rem] font-medium leading-none tracking-tight text-accent min-[440px]:text-[1.85rem] min-[560px]:text-[2rem]">
            {format_duration(duration_ms, duration_format, show_seconds)}
          </p>
          {is_editing_description || entry.tags.length === 0 ? null : (
            <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
              {entry.tags.map((tag) => (
                <li key={tag} className={tag_item_class}>
                  {format_display_tag(tag)}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div
          className={`flex min-w-0 shrink-0 flex-wrap items-center justify-end gap-2 max-[560px]:flex-col max-[560px]:items-stretch ${in_bar ? "w-full" : "min-w-30 max-[860px]:w-full max-[860px]:justify-stretch"}`}
        >
          {is_adding_note ? null : (
            <button
              type="button"
              className={`${get_button_class_name("ghost")} min-w-0 min-[561px]:px-2.5 min-[561px]:py-2 min-[561px]:text-[0.9rem] max-[560px]:flex-1`}
              disabled={is_pending || is_editing_description}
              onClick={() => setIs_adding_note(true)}
            >
              Add note
            </button>
          )}
          <CheckoutButtonGroup
            in_bar={in_bar}
            is_pending={is_pending}
            on_start_checkout={start_checkout}
          />
        </div>
      </div>
      <EntryNotesList
        notes={entry.notes}
        variant="panel"
        in_bar={in_bar}
        is_pending={is_pending}
        on_edit_note={on_edit_note}
        on_delete_note={handle_delete_note}
      />
      {is_adding_note ? (
        <div className="shrink-0">
          <NoteForm
            in_active_panel
            in_bar={in_bar}
            allow_at
            is_pending={is_pending}
            on_cancel={() => setIs_adding_note(false)}
            on_submit={(text, at) => {
              on_add_note(text, at);
              setIs_adding_note(false);
            }}
          />
        </div>
      ) : null}
    </section>
  );
});
