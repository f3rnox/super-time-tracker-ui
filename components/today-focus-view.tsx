"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { format_time } from "@/components/format_time";
import { TodayScopeControls } from "@/components/today-scope-controls";
import { TrackerTopbar } from "@/components/tracker-topbar";
import { build_check_out_request_payload } from "@/lib/build_check_out_request_payload";
import { build_resume_description } from "@/lib/build_resume_description";
import { filter_today_focus_by_sheet_names } from "@/lib/filter_today_focus_by_sheet_names";
import { format_entry_count_label } from "@/lib/format_entry_count_label";
import { format_timer_count_label } from "@/lib/format_timer_count_label";
import { format_display_tag } from "@/lib/format_display_tag";
import { format_duration } from "@/lib/format_duration";
import { finish_running_pomodoro_timer } from "@/lib/finish_running_pomodoro_timer";
import { get_focus_goal_progress_percent } from "@/lib/get_focus_goal_progress_percent";
import { message_from_unknown_error } from "@/lib/message_from_unknown_error";
import { navigate_to_tracker_sheet } from "@/lib/navigate_to_tracker_sheet";
import { post_tracker_action } from "@/lib/post_tracker_action";
import { daily_focus_target_minutes_preference } from "@/lib/preferences/daily_focus_target_minutes_preference";
import { today_scope_preference } from "@/lib/preferences/today_scope_preference";
import { weekly_focus_target_minutes_preference } from "@/lib/preferences/weekly_focus_target_minutes_preference";
import { prompt_check_out_at } from "@/lib/prompt_check_out_at";
import {
  get_pinned_sheet_names_server_snapshot,
  get_pinned_sheet_names_snapshot,
  subscribe_pinned_sheet_names,
} from "@/lib/pinned_sheet_names_store";
import { toggle_pinned_sheet_name } from "@/lib/toggle_pinned_sheet_name";
import { type CheckOutOptions } from "@/lib/types/check_out_options";
import { useCheckOutAction } from "@/lib/use_check_out_action";
import { use_duration_format } from "@/lib/use_duration_format";
import { use_time_format } from "@/lib/use_time_format";
import {
  type TodayFocusEntry,
  type TodayStartDaySuggestion,
  type TodayFocusPageData,
} from "@/lib/types/today_focus";

interface TodayFocusViewProps {
  initial_data: TodayFocusPageData;
}

const tag_item_class =
  "rounded-full bg-tag-bg px-2 py-0.5 text-xs text-tag-text";

/**
 * Minimal today view with running timers and today's entries.
 */
export function TodayFocusView({
  initial_data,
}: Readonly<TodayFocusViewProps>) {
  const router = useRouter();
  const duration_format = use_duration_format();
  const time_format = use_time_format();
  const daily_target_minutes = useSyncExternalStore(
    daily_focus_target_minutes_preference.subscribe,
    daily_focus_target_minutes_preference.get_snapshot,
    daily_focus_target_minutes_preference.get_server_snapshot,
  );
  const weekly_target_minutes = useSyncExternalStore(
    weekly_focus_target_minutes_preference.subscribe,
    weekly_focus_target_minutes_preference.get_snapshot,
    weekly_focus_target_minutes_preference.get_server_snapshot,
  );
  const [data, setData] = useState(initial_data);
  const [error, setError] = useState<string | null>(null);
  const [is_pending, setIs_pending] = useState(false);

  useEffect(() => {
    setData(initial_data);
  }, [initial_data]);

  const scope = useSyncExternalStore(
    today_scope_preference.subscribe,
    today_scope_preference.get_snapshot,
    today_scope_preference.get_server_snapshot,
  );
  const pinned_names = useSyncExternalStore(
    subscribe_pinned_sheet_names,
    get_pinned_sheet_names_snapshot,
    get_pinned_sheet_names_server_snapshot,
  );

  const allowed_sheet_names = useMemo(() => {
    if (scope === "all") {
      return null;
    }

    return new Set(pinned_names);
  }, [scope, pinned_names]);

  const visible_running = useMemo(() => {
    if (allowed_sheet_names === null) {
      return data.runningEntries;
    }

    return data.runningEntries.filter((entry) =>
      allowed_sheet_names.has(entry.sheetName),
    );
  }, [allowed_sheet_names, data.runningEntries]);

  const visible_entries = useMemo(() => {
    if (allowed_sheet_names === null) {
      return data.todayEntries;
    }

    return filter_today_focus_by_sheet_names(
      data.todayEntries,
      allowed_sheet_names,
    );
  }, [allowed_sheet_names, data.todayEntries]);

  const visible_suggestions = useMemo(() => {
    if (allowed_sheet_names === null) {
      return data.startDaySuggestions;
    }

    return data.startDaySuggestions.filter((suggestion) =>
      allowed_sheet_names.has(suggestion.sheetName),
    );
  }, [allowed_sheet_names, data.startDaySuggestions]);

  const visible_total_ms = useMemo(
    () =>
      visible_entries.reduce(
        (total, entry) => total + entry.todayDurationMs,
        0,
      ),
    [visible_entries],
  );

  const run_action = async (action: () => Promise<unknown>): Promise<void> => {
    setIs_pending(true);
    setError(null);

    try {
      await action();
      router.refresh();
    } catch (action_error: unknown) {
      setError(message_from_unknown_error(action_error, "Action failed"));
    } finally {
      setIs_pending(false);
    }
  };

  const daily_target_ms = Number.parseInt(daily_target_minutes, 10) * 60_000;
  const weekly_target_ms = Number.parseInt(weekly_target_minutes, 10) * 60_000;
  const daily_progress = get_focus_goal_progress_percent(
    data.focusStatus.todayTrackedMs,
    daily_target_ms,
  );
  const weekly_progress = get_focus_goal_progress_percent(
    data.focusStatus.weekTrackedMs,
    weekly_target_ms,
  );

  return (
    <>
      <TrackerTopbar breadcrumb={{ current: "Today" }} />
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-5 pb-12 pt-6">
        <header className="flex w-full flex-col gap-2 text-center">
          <h1 className="m-0 text-[1.5rem] font-[650] tracking-tight">Today</h1>
          <p className="m-0 text-[0.9rem] leading-relaxed text-muted">
            Running timers and time logged today.
          </p>
        </header>

        {error === null ? null : (
          <p className="m-0 w-full rounded-md border border-danger-border bg-danger-soft px-3 py-2 text-[0.85rem] text-danger">
            {error}
          </p>
        )}

        <TodayScopeControls
          sheet_names={data.sheetNames}
          on_toggle_pin={toggle_pinned_sheet_name}
        />

        <section
          className="w-full rounded-md border border-panel-border bg-panel p-4 shadow-sm"
          aria-label="Focus goals progress"
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
              Focus goals
            </p>
            <Link
              href="/settings/goals"
              className="text-[0.78rem] font-semibold text-accent no-underline hover:underline"
            >
              Edit goals
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 min-[620px]:grid-cols-2">
            <FocusGoalStripItem
              label="Daily"
              tracked_ms={data.focusStatus.todayTrackedMs}
              target_ms={daily_target_ms}
              progress_percent={daily_progress}
              duration_format={duration_format}
            />
            <FocusGoalStripItem
              label="Weekly"
              tracked_ms={data.focusStatus.weekTrackedMs}
              target_ms={weekly_target_ms}
              progress_percent={weekly_progress}
              duration_format={duration_format}
            />
          </div>
        </section>

        <section
          className="w-full rounded-md border border-panel-border bg-panel p-4 shadow-sm"
          aria-label="Today total"
        >
          <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
            Tracked today
            {scope === "pinned" ? " (pinned)" : ""}
          </p>
          <p className="m-0 mt-1 font-mono text-[1.75rem] font-semibold text-accent">
            {format_duration(visible_total_ms, duration_format)}
          </p>
        </section>

        <section
          className="flex w-full flex-col gap-3"
          aria-label="Running timers"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
              Running now
            </h2>
            <span className="text-[0.8rem] text-muted">
              {format_timer_count_label(visible_running.length)}
            </span>
          </div>
          {visible_running.length === 0 ? (
            <p className="m-0 text-[0.9rem] text-muted">
              No running timers for the selected scope.
            </p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {visible_running.map((entry) => (
                <RunningEntryRow
                  key={`${entry.sheetName}-${entry.id}`}
                  entry={entry}
                  is_pending={is_pending}
                  duration_format={duration_format}
                  time_format={time_format}
                  on_check_out={(options) =>
                    run_action(async () => {
                      await post_tracker_action(
                        "/api/out",
                        build_check_out_request_payload(
                          entry.sheetName,
                          options,
                        ),
                      );
                      finish_running_pomodoro_timer();
                    })
                  }
                />
              ))}
            </ul>
          )}
        </section>

        <section
          className="flex w-full flex-col gap-3"
          aria-label="Start day suggestions"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
              Start day
            </h2>
            <span className="text-[0.8rem] text-muted">
              Suggested first task from yesterday
            </span>
          </div>
          {visible_suggestions.length === 0 ? (
            <p className="m-0 text-[0.9rem] text-muted">
              No yesterday history yet for the selected scope.
            </p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {visible_suggestions.map((suggestion) => (
                <StartDaySuggestionRow
                  key={`${suggestion.sheetName}-${suggestion.lastLoggedAt}`}
                  suggestion={suggestion}
                  is_pending={is_pending}
                  is_pinned={pinned_names.includes(suggestion.sheetName)}
                  time_format={time_format}
                  on_toggle_pin={toggle_pinned_sheet_name}
                  on_start={() =>
                    run_action(() =>
                      post_tracker_action("/api/in", {
                        sheetName: suggestion.sheetName,
                        description: build_resume_description(
                          suggestion.suggestedDescription,
                          suggestion.suggestedTags,
                        ),
                      }),
                    )
                  }
                />
              ))}
            </ul>
          )}
        </section>

        <section
          className="flex w-full flex-col gap-3"
          aria-label="Today's entries"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
              Today&apos;s entries
            </h2>
            <span className="text-[0.8rem] text-muted">
              {format_entry_count_label(visible_entries.length) ?? "None"}
            </span>
          </div>

          {visible_entries.length === 0 ? (
            <p className="m-0 text-[0.9rem] text-muted">
              {scope === "pinned" && pinned_names.length === 0
                ? "Pin at least one sheet to see today’s activity."
                : "No time logged today for the selected scope."}
            </p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {visible_entries.map((entry) => (
                <TodayEntryRow
                  key={`${entry.sheetName}-${entry.id}`}
                  entry={entry}
                  duration_format={duration_format}
                  time_format={time_format}
                  show_sheet_name={scope === "all" || pinned_names.length > 1}
                />
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}

interface FocusGoalStripItemProps {
  label: string;
  tracked_ms: number;
  target_ms: number;
  progress_percent: number;
  duration_format: import("@/lib/types/ui_preferences").DurationFormat;
}

function FocusGoalStripItem({
  label,
  tracked_ms,
  target_ms,
  progress_percent,
  duration_format,
}: Readonly<FocusGoalStripItemProps>) {
  return (
    <article className="rounded-md border border-panel-border bg-background px-3 py-2.5">
      <p className="m-0 text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-muted">
        {label}
      </p>
      <p className="m-0 mt-1 font-mono text-[0.95rem] font-semibold text-accent">
        {format_duration(tracked_ms, duration_format)} /{" "}
        {format_duration(target_ms, duration_format)}
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-accent-soft">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${progress_percent}%` }}
        />
      </div>
    </article>
  );
}

interface RunningEntryRowProps {
  entry: import("@/lib/types/tracker_state").SerializedEntry;
  is_pending: boolean;
  duration_format: import("@/lib/types/ui_preferences").DurationFormat;
  time_format: import("@/lib/types/ui_preferences").TimeFormat;
  on_check_out: (options?: CheckOutOptions) => Promise<void>;
}

function RunningEntryRow({
  entry,
  is_pending,
  duration_format,
  time_format,
  on_check_out,
}: Readonly<RunningEntryRowProps>) {
  const [duration_ms, setDuration_ms] = useState(
    () => Date.now() - +new Date(entry.start),
  );
  const check_out = useCheckOutAction((options) => {
    void on_check_out(options);
  });

  useEffect(() => {
    setDuration_ms(Date.now() - +new Date(entry.start));

    const interval_id = globalThis.setInterval(() => {
      setDuration_ms(Date.now() - +new Date(entry.start));
    }, 1000);

    return () => {
      globalThis.clearInterval(interval_id);
    };
  }, [entry.start]);

  const start_label = format_time(entry.start, time_format);

  return (
    <li className="rounded-md border border-panel-border bg-panel px-3.5 py-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-muted">
            {entry.sheetName}
          </p>
          <p className="m-0 mt-1 truncate text-[0.95rem] font-medium">
            {entry.description || "Untitled entry"}
          </p>
          <p className="m-0 mt-1 text-[0.8rem] text-muted">
            Since {start_label}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="font-mono text-[0.92rem] font-semibold text-accent">
            {format_duration(duration_ms, duration_format)}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="cursor-pointer rounded border border-danger-border bg-danger-soft px-2 py-1 text-[0.74rem] font-semibold text-danger disabled:cursor-not-allowed disabled:opacity-55"
              disabled={is_pending}
              onClick={() => {
                void check_out();
              }}
            >
              Check out
            </button>
            <button
              type="button"
              className="cursor-pointer rounded border border-danger-border bg-danger-soft px-2 py-1 text-[0.74rem] font-semibold text-danger disabled:cursor-not-allowed disabled:opacity-55"
              disabled={is_pending}
              onClick={() => {
                const at = prompt_check_out_at();

                if (at === null) {
                  return;
                }

                void check_out({ at });
              }}
              title="Check out at specific time"
            >
              @
            </button>
            <Link
              href="/"
              className="text-[0.75rem] font-semibold text-accent no-underline hover:underline"
              onClick={() => navigate_to_tracker_sheet(entry.sheetName)}
            >
              Open
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

interface StartDaySuggestionRowProps {
  suggestion: TodayStartDaySuggestion;
  is_pending: boolean;
  is_pinned: boolean;
  time_format: import("@/lib/types/ui_preferences").TimeFormat;
  on_toggle_pin: (sheet_name: string) => void;
  on_start: () => Promise<void>;
}

function StartDaySuggestionRow({
  suggestion,
  is_pending,
  is_pinned,
  time_format,
  on_toggle_pin,
  on_start,
}: Readonly<StartDaySuggestionRowProps>) {
  return (
    <li className="rounded-md border border-panel-border bg-panel px-3.5 py-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-muted">
              {suggestion.sheetName}
            </p>
            <button
              type="button"
              className="cursor-pointer rounded border border-panel-border bg-background px-1.5 py-0.5 text-[0.68rem] font-semibold text-muted hover:bg-surface-hover hover:text-foreground"
              onClick={() => on_toggle_pin(suggestion.sheetName)}
              title={is_pinned ? "Unpin sheet" : "Pin sheet"}
            >
              {is_pinned ? "Pinned" : "Pin"}
            </button>
          </div>
          <p className="m-0 mt-1 truncate text-[0.95rem] font-medium">
            {suggestion.suggestedDescription || "Untitled entry"}
          </p>
          <p className="m-0 mt-1 text-[0.8rem] text-muted">
            Yesterday at {format_time(suggestion.lastLoggedAt, time_format)}
          </p>
          {suggestion.suggestedTags.length > 0 ? (
            <ul className="m-0 mt-2 flex list-none flex-wrap gap-1.5 p-0">
              {suggestion.suggestedTags.map((tag) => (
                <li key={tag} className={tag_item_class}>
                  {format_display_tag(tag)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <button
          type="button"
          className="cursor-pointer rounded border border-accent-border bg-accent px-2.5 py-1.5 text-[0.76rem] font-semibold text-accent-text-on disabled:cursor-not-allowed disabled:opacity-55"
          disabled={is_pending}
          onClick={() => {
            void on_start();
          }}
        >
          Start task
        </button>
      </div>
    </li>
  );
}

interface TodayEntryRowProps {
  entry: TodayFocusEntry;
  duration_format: import("@/lib/types/ui_preferences").DurationFormat;
  time_format: import("@/lib/types/ui_preferences").TimeFormat;
  show_sheet_name: boolean;
}

/**
 * Compact row for a single today entry.
 */
function TodayEntryRow({
  entry,
  duration_format,
  time_format,
  show_sheet_name,
}: Readonly<TodayEntryRowProps>) {
  const start_label = format_time(entry.start, time_format);
  const end_label =
    entry.end === null ? "now" : format_time(entry.end, time_format);

  return (
    <li className="rounded-md border border-panel-border bg-panel px-3.5 py-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {show_sheet_name ? (
            <p className="m-0 mb-1 text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-muted">
              {entry.sheetName}
            </p>
          ) : null}
          <p className="m-0 text-[0.95rem] font-medium">{entry.description}</p>
          <p className="m-0 mt-1 text-[0.8rem] text-muted">
            {start_label} → {end_label}
          </p>
          {entry.tags.length > 0 ? (
            <ul className="m-0 mt-2 flex list-none flex-wrap gap-1.5 p-0">
              {entry.tags.map((tag) => (
                <li key={tag} className={tag_item_class}>
                  {format_display_tag(tag)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="font-mono text-[0.9rem] font-semibold text-accent">
            {format_duration(entry.todayDurationMs, duration_format)}
          </span>
          <Link
            href="/"
            className="text-[0.8rem] font-semibold text-accent no-underline hover:underline"
            onClick={() => navigate_to_tracker_sheet(entry.sheetName)}
          >
            Open sheet
          </Link>
        </div>
      </div>
    </li>
  );
}
