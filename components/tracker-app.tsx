"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { type ActiveEntryPanelHandle } from "@/components/active-entry-panel";
import {
  CheckInFormCollapsible,
  type CheckInFormCollapsibleHandle,
} from "@/components/check-in-form-collapsible";
import { ConfirmDialogProvider } from "@/components/confirm-dialog-provider";
import { FocusGoalsNudgesBanner } from "@/components/focus-goals-nudges-banner";
import { TrackerKeyboardShortcuts } from "@/components/tracker-keyboard-shortcuts";
import { EntryTagFilter } from "@/components/entry-tag-filter";
import { TrackerEntrySearchBar } from "@/components/tracker-entry-search-bar";
import { EntryList } from "@/components/entry-list";
import { SheetSidebar } from "@/components/sheet-sidebar";
import { TrackerActiveBar } from "@/components/tracker-active-bar";
import { TrackerDocumentTitle } from "@/components/tracker-document-title";
import { TrackerTopbar } from "@/components/tracker-topbar";
import { build_check_out_request_payload } from "@/lib/build_check_out_request_payload";
import { build_resume_description } from "@/lib/build_resume_description";
import { collect_tags_from_entries } from "@/lib/collect_tags_from_entries";
import { filter_entries_by_tags } from "@/lib/filter_entries_by_tags";
import { filter_serialized_entries_by_search_query } from "@/lib/filter_serialized_entries_by_search_query";
import { finish_running_pomodoro_timer } from "@/lib/finish_running_pomodoro_timer";
import { get_running_entry_key } from "@/lib/get_running_entry_key";
import {
  get_sheet_tag_filter_server_snapshot,
  get_sheet_tag_filter_snapshot,
} from "@/lib/get_sheet_tag_filter_snapshot";
import { get_serialized_entries_total_ms } from "@/lib/get_serialized_entries_total_ms";
import { notify_desktop } from "@/lib/notify_desktop";
import { subscribe_tracker_state_sync } from "@/lib/notify_tracker_state_sync";
import { delete_tracker_action } from "@/lib/delete_tracker_action";
import { patch_tracker_action } from "@/lib/patch_tracker_action";
import { post_tracker_action } from "@/lib/post_tracker_action";
import { set_sheet_tag_filter } from "@/lib/set_sheet_tag_filter";
import { sort_serialized_entries } from "@/lib/sort_serialized_entries";
import { subscribe_sheet_tag_filters } from "@/lib/subscribe_sheet_tag_filters";
import { apply_optimistic_sheet_switch } from "@/lib/apply_optimistic_sheet_switch";
import { get_button_class_name } from "@/lib/get_button_class_name";
import { sync_active_sheet_preference } from "@/lib/sync_active_sheet_preference";
import { use_clear_tag_filters_on_sheet_change } from "@/lib/use_clear_tag_filters_on_sheet_change";
import { useDesktopNotifications } from "@/lib/use_desktop_notifications";
import { use_entry_list_sort } from "@/lib/use_entry_list_sort";
import { use_tag_filter_mode } from "@/lib/use_tag_filter_mode";
import { type EntryEditFormValues } from "@/components/entry-edit-form";
import { type TrackerState } from "@/lib/types/tracker_state";

interface TrackerAppProps {
  initial_state: TrackerState;
}

/**
 * Main client application for the super-time-tracker web UI.
 */
export function TrackerApp({ initial_state }: Readonly<TrackerAppProps>) {
  const [state, setState] = useState<TrackerState>(initial_state);
  const [error, setError] = useState<string | null>(null);
  const [is_pending, setIs_pending] = useState(false);
  const [is_switching_sheet, setIs_switching_sheet] = useState(false);
  const [entry_search_query, setEntry_search_query] = useState("");
  const state_before_sheet_switch_ref = useRef<TrackerState>(initial_state);

  useEffect(() => {
    sync_active_sheet_preference(initial_state);
  }, [initial_state]);

  const run_action = async (
    action: () => Promise<TrackerState>,
  ): Promise<void> => {
    setIs_pending(true);
    setError(null);

    try {
      const next_state = await action();
      const should_finish_pomodoro =
        state.activeEntry !== null && next_state.activeEntry === null;
      const previous_running_entry = state.runningEntry;
      const next_running_entry = next_state.runningEntry;

      sync_active_sheet_preference(next_state);
      setState(next_state);

      if (should_finish_pomodoro) {
        finish_running_pomodoro_timer();
      }

      if (!desktop_notifications_enabled) {
        return;
      }

      if (previous_running_entry === null && next_running_entry !== null) {
        notify_desktop({
          title: "Tracking started",
          body: `${next_running_entry.description || "Untitled entry"} (${next_running_entry.sheetName})`,
          tag: "tracker-running-entry",
        });
        return;
      }

      if (previous_running_entry !== null && next_running_entry === null) {
        notify_desktop({
          title: "Tracking stopped",
          body: `${previous_running_entry.description || "Untitled entry"} (${previous_running_entry.sheetName})`,
          tag: "tracker-running-entry",
        });
        return;
      }

      if (
        previous_running_entry !== null &&
        next_running_entry !== null &&
        get_running_entry_key(previous_running_entry) !==
          get_running_entry_key(next_running_entry)
      ) {
        notify_desktop({
          title: "Tracking switched",
          body: `${next_running_entry.description || "Untitled entry"} (${next_running_entry.sheetName})`,
          tag: "tracker-running-entry",
        });
      }
    } catch (action_error: unknown) {
      setError(
        action_error instanceof Error
          ? action_error.message
          : String(action_error),
      );
    } finally {
      setIs_pending(false);
    }
  };

  const active_sheet =
    state.activeSheetName ??
    state.sheets.find((sheet) => sheet.isActive)?.name ??
    "main";

  const tag_filter_mode = use_tag_filter_mode();
  const entry_list_sort = use_entry_list_sort();
  const desktop_notifications_enabled = useDesktopNotifications();
  const clear_tag_filters_on_sheet_change =
    use_clear_tag_filters_on_sheet_change();
  const previous_active_sheet_ref = useRef<string | null>(null);
  const check_in_form_ref = useRef<CheckInFormCollapsibleHandle>(null);
  const active_entry_panel_ref = useRef<ActiveEntryPanelHandle>(null);

  useEffect(() => {
    if (
      !clear_tag_filters_on_sheet_change ||
      previous_active_sheet_ref.current === null ||
      previous_active_sheet_ref.current === active_sheet
    ) {
      previous_active_sheet_ref.current = active_sheet;
      return;
    }

    set_sheet_tag_filter(active_sheet, []);
    previous_active_sheet_ref.current = active_sheet;
  }, [active_sheet, clear_tag_filters_on_sheet_change]);

  useEffect(() => {
    setEntry_search_query("");
  }, [active_sheet]);

  const filter_tags = useSyncExternalStore(
    subscribe_sheet_tag_filters,
    () => get_sheet_tag_filter_snapshot(active_sheet),
    get_sheet_tag_filter_server_snapshot,
  );

  const sheet_tags = useMemo(
    () => collect_tags_from_entries(state.activeSheetEntries),
    [state.activeSheetEntries],
  );

  const filtered_entries = useMemo(() => {
    if (is_switching_sheet) {
      return [];
    }

    const matching = filter_entries_by_tags(
      state.activeSheetEntries,
      filter_tags,
      tag_filter_mode,
    );

    const searched = filter_serialized_entries_by_search_query(
      matching,
      entry_search_query,
    );

    return sort_serialized_entries(searched, entry_list_sort);
  }, [
    state.activeSheetEntries,
    filter_tags,
    tag_filter_mode,
    entry_list_sort,
    entry_search_query,
    is_switching_sheet,
  ]);

  const filtered_total_ms = useMemo(
    () => get_serialized_entries_total_ms(filtered_entries),
    [filtered_entries],
  );

  useEffect(() => {
    const refresh_state_after_sync = (): void => {
      if (is_pending || is_switching_sheet) {
        return;
      }

      void fetch("/api/state")
        .then(async (response) => {
          if (!response.ok) {
            throw new Error("Failed to refresh tracker state");
          }

          return (await response.json()) as TrackerState;
        })
        .then((next_state) => {
          sync_active_sheet_preference(next_state);
          setState((current_state) => {
            const current_active_key =
              current_state.activeEntry === null
                ? null
                : `${current_state.activeEntry.sheetName}:${current_state.activeEntry.id}`;
            const next_active_key =
              next_state.activeEntry === null
                ? null
                : `${next_state.activeEntry.sheetName}:${next_state.activeEntry.id}`;

            if (current_active_key === next_active_key) {
              return current_state;
            }

            return next_state;
          });
        })
        .catch(() => {
          // Sync toasts already communicate failures.
        });
    };

    return subscribe_tracker_state_sync(refresh_state_after_sync);
  }, [is_pending, is_switching_sheet]);

  const entries_empty_message = is_switching_sheet
    ? `Loading entries for "${active_sheet}"…`
    : entry_search_query.trim().length > 0
      ? filter_tags.length > 0
        ? `No entries on sheet "${active_sheet}" match your search and selected tags.`
        : `No entries on sheet "${active_sheet}" match your search.`
      : filter_tags.length > 0
        ? tag_filter_mode === "any"
          ? `No entries on sheet "${active_sheet}" match any selected tag.`
          : `No entries on sheet "${active_sheet}" match all selected tags.`
        : `No entries on sheet "${active_sheet}".`;

  const select_sheet = (name: string): void => {
    if (name === active_sheet && !is_switching_sheet) {
      return;
    }

    state_before_sheet_switch_ref.current = state;

    const optimistic = apply_optimistic_sheet_switch(state, name);

    sync_active_sheet_preference(optimistic);
    setState(optimistic);
    setIs_switching_sheet(true);
    setError(null);

    void post_tracker_action("/api/sheet", { name })
      .then((next_state) => {
        sync_active_sheet_preference(next_state);
        setState(next_state);
      })
      .catch((action_error: unknown) => {
        setError(
          action_error instanceof Error
            ? action_error.message
            : String(action_error),
        );
        setState(state_before_sheet_switch_ref.current);
      })
      .finally(() => {
        setIs_switching_sheet(false);
      });
  };

  const edit_entry = (
    sheet_name: string,
    entry_id: number,
    values: EntryEditFormValues,
  ): Promise<TrackerState> =>
    patch_tracker_action("/api/entry", {
      sheetName: sheet_name,
      entryId: entry_id,
      ...values,
    });

  return (
    <ConfirmDialogProvider>
      <TrackerDocumentTitle active_entry={state.activeEntry} />
      <TrackerKeyboardShortcuts
        sheets={state.sheets}
        active_sheet_name={active_sheet}
        active_entry={state.activeEntry}
        is_pending={is_pending}
        check_in_form_ref={check_in_form_ref}
        active_entry_panel_ref={active_entry_panel_ref}
        on_select_sheet={select_sheet}
        on_check_out={(options) =>
          run_action(() =>
            post_tracker_action(
              "/api/out",
              build_check_out_request_payload(active_sheet, options),
            ),
          )
        }
      />
      <div className="relative z-1">
        <TrackerTopbar />
      </div>
      <div className="mx-auto max-w-[1120px] px-4 pb-10 pt-4 sm:px-5 sm:pt-5">
        {error !== null ? (
          <p className="mb-4 border border-danger-border bg-danger-soft px-3 py-2.5 text-danger-text">
            {error}
          </p>
        ) : null}
        <FocusGoalsNudgesBanner
          has_running_timer={state.runningEntry !== null}
          on_check_in_shortcut={() => {
            check_in_form_ref.current?.expand_and_focus();
          }}
        />

        <div className="grid grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)] items-stretch border border-panel-border bg-panel shadow-sm max-[960px]:grid-cols-1">
          <div className="flex min-h-0 min-w-0 flex-col border-r border-panel-border p-4 max-[860px]:border-r-0 max-[860px]:border-b">
            <SheetSidebar
              sheets={state.sheets}
              db_path={state.dbPath}
              is_pending={is_pending}
              on_select={select_sheet}
              on_create={(name) =>
                run_action(() => post_tracker_action("/api/sheet", { name }))
              }
              on_rename={(name, new_name) =>
                run_action(() =>
                  patch_tracker_action("/api/sheet", {
                    name,
                    newName: new_name,
                  }),
                )
              }
              on_delete={(name) =>
                run_action(() =>
                  post_tracker_action("/api/sheet", { name, delete: true }),
                )
              }
            />
          </div>

          <div className="flex min-w-0 flex-col">
            <section className="flex min-w-0 flex-col gap-4 border-b border-panel-border border-l-4 border-l-accent p-4">
              {state.activeEntry === null ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-panel-border bg-background px-3 py-2">
                  <div className="min-w-0">
                    <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
                      Quick action
                    </p>
                    <p className="m-0 mt-1 text-[0.9rem] font-medium">
                      Jump into Pomodoro without leaving the tracker.
                    </p>
                  </div>
                  <Link
                    href="/pomodoro"
                    className={`${get_button_class_name(
                      "primary",
                    )} inline-flex min-w-40 flex-col items-center justify-center whitespace-nowrap text-center`}
                    aria-label="Open Pomodoro timer"
                  >
                    <span className="text-white text-[0.9rem] leading-none">
                      Start Pomodoro
                    </span>
                    <span className="text-white mt-1 text-[0.72rem] font-medium leading-none opacity-85">
                      Focus timer
                    </span>
                  </Link>
                </div>
              ) : null}
              <TrackerActiveBar
                ref={active_entry_panel_ref}
                active_entry={state.activeEntry}
                sheets={state.sheets}
                known_tags={state.knownTags}
                is_pending={is_pending}
                on_check_out={(options) =>
                  run_action(() =>
                    post_tracker_action(
                      "/api/out",
                      build_check_out_request_payload(active_sheet, options),
                    ),
                  )
                }
                on_delete={() =>
                  run_action(() =>
                    post_tracker_action("/api/entry", {
                      sheetName: active_sheet,
                      entryId: state.activeEntry?.id,
                    }),
                  )
                }
                on_edit={(values) =>
                  run_action(() =>
                    edit_entry(
                      active_sheet,
                      state.activeEntry?.id ?? 0,
                      values,
                    ),
                  )
                }
                on_move={(target_sheet_name) =>
                  run_action(() =>
                    post_tracker_action("/api/entry/move", {
                      sheetName: active_sheet,
                      entryId: state.activeEntry?.id,
                      targetSheetName: target_sheet_name,
                    }),
                  )
                }
                on_add_note={(text, at) =>
                  run_action(() =>
                    post_tracker_action("/api/note", {
                      text,
                      ...(at !== undefined ? { at } : {}),
                      sheetName: active_sheet,
                      entryId: state.activeEntry?.id,
                    }),
                  )
                }
                on_edit_note={(timestamp, text) =>
                  run_action(() =>
                    patch_tracker_action("/api/note", {
                      sheetName: active_sheet,
                      entryId: state.activeEntry?.id,
                      timestamp,
                      text,
                    }),
                  )
                }
                on_delete_note={(timestamp) =>
                  run_action(() =>
                    delete_tracker_action("/api/note", {
                      sheetName: active_sheet,
                      entryId: state.activeEntry?.id,
                      timestamp,
                    }),
                  )
                }
              />
              {state.activeEntry === null ? (
                <CheckInFormCollapsible
                  ref={check_in_form_ref}
                  known_tags={state.knownTags}
                  is_pending={is_pending}
                  trailing={
                    <p className="m-0 text-[0.85rem] leading-tight text-muted">
                      Not tracking
                    </p>
                  }
                  on_submit={(values) =>
                    run_action(() =>
                      post_tracker_action("/api/in", {
                        ...values,
                        sheetName: active_sheet,
                      }),
                    )
                  }
                />
              ) : null}
            </section>

            <section className="flex min-w-0 flex-col gap-4 p-4">
              <EntryList
                title="Entries"
                entries={filtered_entries}
                merge_context_entries={state.activeSheetEntries}
                sheets={state.sheets}
                known_tags={state.knownTags}
                total_ms={filtered_total_ms}
                empty_message={entries_empty_message}
                is_pending={is_pending}
                show_sheet_name={false}
                header_extra={
                  <div className="flex w-full flex-col gap-3">
                    <TrackerEntrySearchBar
                      query={entry_search_query}
                      active_sheet={active_sheet}
                      is_pending={is_pending}
                      on_query_change={setEntry_search_query}
                    />
                    <EntryTagFilter
                      sheet_name={active_sheet}
                      sheet_tags={sheet_tags}
                    />
                  </div>
                }
                on_delete={(entry) =>
                  run_action(() =>
                    post_tracker_action("/api/entry", {
                      sheetName: entry.sheetName,
                      entryId: entry.id,
                    }),
                  )
                }
                on_edit={(entry, values) =>
                  run_action(() =>
                    edit_entry(entry.sheetName, entry.id, values),
                  )
                }
                on_move={(entry, target_sheet_name) =>
                  run_action(() =>
                    post_tracker_action("/api/entry/move", {
                      sheetName: entry.sheetName,
                      entryId: entry.id,
                      targetSheetName: target_sheet_name,
                    }),
                  )
                }
                on_move_many={(entries, target_sheet_name) =>
                  run_action(() =>
                    post_tracker_action("/api/entry/move-bulk", {
                      entries: entries.map((entry) => ({
                        sheetName: entry.sheetName,
                        entryId: entry.id,
                      })),
                      targetSheetName: target_sheet_name,
                    }),
                  )
                }
                on_delete_many={(entries) =>
                  run_action(() =>
                    post_tracker_action("/api/entry/delete-bulk", {
                      entries: entries.map((entry) => ({
                        sheetName: entry.sheetName,
                        entryId: entry.id,
                      })),
                    }),
                  )
                }
                on_edit_note={(entry, timestamp, text) =>
                  run_action(() =>
                    patch_tracker_action("/api/note", {
                      sheetName: entry.sheetName,
                      entryId: entry.id,
                      timestamp,
                      text,
                    }),
                  )
                }
                on_add_note={(entry, text) =>
                  run_action(() =>
                    post_tracker_action("/api/note", {
                      sheetName: entry.sheetName,
                      entryId: entry.id,
                      text,
                    }),
                  )
                }
                on_resume={(entry) =>
                  run_action(() =>
                    post_tracker_action("/api/in", {
                      description: build_resume_description(
                        entry.description,
                        entry.tags,
                      ),
                      sheetName: entry.sheetName,
                    }),
                  )
                }
                on_split={(entry, at) =>
                  run_action(() =>
                    post_tracker_action("/api/entry/split", {
                      sheetName: entry.sheetName,
                      entryId: entry.id,
                      at,
                    }),
                  )
                }
                on_merge={(entry, direction) =>
                  run_action(() =>
                    post_tracker_action("/api/entry/merge", {
                      sheetName: entry.sheetName,
                      entryId: entry.id,
                      direction,
                    }),
                  )
                }
              />
            </section>
          </div>
        </div>
      </div>
    </ConfirmDialogProvider>
  );
}
