"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EntryList } from "@/components/entry-list";
import { type EntryEditFormValues } from "@/components/entry-edit-form";
import { EntrySearchFiltersPanel } from "@/components/entry-search-filters";
import { TrackerTopbar } from "@/components/tracker-topbar";
import { build_entry_search_href } from "@/lib/build_entry_search_href";
import { format_search_result_count_label } from "@/lib/format_search_result_count_label";
import { build_resume_description } from "@/lib/build_resume_description";
import { entry_search_filters_equal } from "@/lib/entry_search_filters_equal";
import { delete_tracker_action } from "@/lib/delete_tracker_action";
import { fetch_entry_search_results } from "@/lib/fetch_entry_search_results";
import { get_input_class_name } from "@/lib/get_input_class_name";
import { get_serialized_entries_total_ms } from "@/lib/get_serialized_entries_total_ms";
import { navigate_to_tracker_sheet } from "@/lib/navigate_to_tracker_sheet";
import { patch_tracker_action } from "@/lib/patch_tracker_action";
import { post_tracker_action } from "@/lib/post_tracker_action";
import {
  type EntrySearchFilters,
  type EntrySearchPageData,
} from "@/lib/types/entry_search";
import { type SerializedSheet } from "@/lib/types/tracker_state";
import { use_debounced_value } from "@/lib/use_debounced_value";

interface EntrySearchViewProps {
  initial_filters: EntrySearchFilters;
  initial_data: EntrySearchPageData;
}

/**
 * Global entry search page with text search and sheet, tag, and date filters.
 */
export function EntrySearchView({
  initial_filters,
  initial_data,
}: Readonly<EntrySearchViewProps>) {
  const router = useRouter();
  const [filters, setFilters] = useState(initial_filters);
  const [data, setData] = useState(initial_data);
  const [error, setError] = useState<string | null>(null);
  const [is_pending, setIs_pending] = useState(false);
  const debounced_filters = use_debounced_value(filters, 250);
  const skip_initial_fetch_ref = useRef(true);

  useEffect(() => {
    setFilters(initial_filters);
    setData(initial_data);
  }, [initial_filters, initial_data]);

  useEffect(() => {
    router.replace(build_entry_search_href(debounced_filters), {
      scroll: false,
    });
  }, [debounced_filters, router]);

  useEffect(() => {
    if (
      skip_initial_fetch_ref.current &&
      entry_search_filters_equal(debounced_filters, initial_filters)
    ) {
      skip_initial_fetch_ref.current = false;
      return;
    }

    skip_initial_fetch_ref.current = false;

    let cancelled = false;

    const load_results = async (): Promise<void> => {
      setIs_pending(true);
      setError(null);

      try {
        const next_data = await fetch_entry_search_results(debounced_filters);

        if (!cancelled) {
          setData(next_data);
        }
      } catch (load_error: unknown) {
        if (!cancelled) {
          setError(
            load_error instanceof Error
              ? load_error.message
              : String(load_error),
          );
        }
      } finally {
        if (!cancelled) {
          setIs_pending(false);
        }
      }
    };

    void load_results();

    return () => {
      cancelled = true;
    };
  }, [debounced_filters, initial_filters]);

  const sheets = useMemo((): SerializedSheet[] => {
    return data.sheetNames.map((name) => ({
      name,
      activeEntryID: null,
      entryCount: 0,
      isActive: false,
      hasActiveEntry: false,
    }));
  }, [data.sheetNames]);

  const total_ms = useMemo(
    () => get_serialized_entries_total_ms(data.entries),
    [data.entries],
  );

  const run_action = useCallback(
    async (action: () => Promise<unknown>): Promise<void> => {
      setIs_pending(true);
      setError(null);

      try {
        await action();
        const next_data = await fetch_entry_search_results(debounced_filters);
        setData(next_data);
      } catch (action_error: unknown) {
        setError(
          action_error instanceof Error
            ? action_error.message
            : String(action_error),
        );
      } finally {
        setIs_pending(false);
      }
    },
    [debounced_filters],
  );

  const empty_message =
    filters.query.trim().length > 0 ||
    filters.sheetName.length > 0 ||
    filters.tag.length > 0 ||
    filters.fromDate.length > 0 ||
    filters.toDate.length > 0
      ? "No entries match your search."
      : "Showing recent entries. Type to search descriptions, tags, and notes.";

  return (
    <>
      <TrackerTopbar breadcrumb={{ current: "Search" }} />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 pb-12 pt-6">
        <header className="flex flex-col gap-2">
          <h1 className="m-0 text-[1.5rem] font-[650] tracking-tight">
            Search entries
          </h1>
          <p className="m-0 text-[0.9rem] leading-relaxed text-muted">
            Search across descriptions, @tags, and notes. Filter by sheet, tag,
            or date range.
          </p>
        </header>

        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
            Search
          </span>
          <input
            type="search"
            className={get_input_class_name()}
            placeholder="Search descriptions, tags, notes…"
            value={filters.query}
            disabled={is_pending}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                query: event.target.value,
              }))
            }
          />
        </label>

        <EntrySearchFiltersPanel
          filters={filters}
          sheet_names={data.sheetNames}
          tag_names={data.tagNames}
          is_pending={is_pending}
          on_change={setFilters}
        />

        {error === null ? null : (
          <p className="m-0 border border-danger-border bg-danger-soft px-3 py-2.5 text-[0.85rem] text-danger-text">
            {error}
          </p>
        )}

        <section className="rounded-md border border-panel-border bg-panel p-4 shadow-sm">
          <p className="m-0 mb-3 text-[0.85rem] text-muted">
            {format_search_result_count_label(data.totalCount)}
            {data.totalCount > data.entries.length
              ? ` (showing ${data.entries.length})`
              : null}
          </p>

          <EntryList
            title="Results"
            entries={data.entries}
            sheets={sheets}
            known_tags={data.tagNames}
            total_ms={total_ms}
            empty_message={empty_message}
            is_pending={is_pending}
            show_sheet_name
            on_delete={(entry) =>
              run_action(() =>
                delete_tracker_action("/api/entry", {
                  sheetName: entry.sheetName,
                  entryId: entry.id,
                }),
              )
            }
            on_edit={(entry, values: EntryEditFormValues) =>
              run_action(() =>
                patch_tracker_action("/api/entry", {
                  sheetName: entry.sheetName,
                  entryId: entry.id,
                  ...values,
                }),
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
            on_edit_note={(entry, timestamp, original_text, text) =>
              run_action(() =>
                patch_tracker_action("/api/note", {
                  sheetName: entry.sheetName,
                  entryId: entry.id,
                  timestamp,
                  originalText: original_text,
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
              run_action(async () => {
                navigate_to_tracker_sheet(entry.sheetName);
                await post_tracker_action("/api/in", {
                  description: build_resume_description(
                    entry.description,
                    entry.tags,
                  ),
                  sheetName: entry.sheetName,
                });
                router.push("/");
              })
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
      </main>
    </>
  );
}
