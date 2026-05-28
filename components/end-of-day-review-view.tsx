"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { format_datetime_hint } from "@/components/format_datetime_hint";
import { format_time } from "@/components/format_time";
import { NoteForm } from "@/components/note-form";
import { TagAutocompleteInput } from "@/components/tag-autocomplete-input";
import { TrackerTopbar } from "@/components/tracker-topbar";
import { build_check_out_request_payload } from "@/lib/build_check_out_request_payload";
import { build_resume_description } from "@/lib/build_resume_description";
import { format_display_tag } from "@/lib/format_display_tag";
import { format_duration } from "@/lib/format_duration";
import { get_button_class_name } from "@/lib/get_button_class_name";
import { get_input_class_name } from "@/lib/get_input_class_name";
import { message_from_unknown_error } from "@/lib/message_from_unknown_error";
import { patch_tracker_action } from "@/lib/patch_tracker_action";
import { post_tracker_action } from "@/lib/post_tracker_action";
import {
  type EndOfDayReviewEntry,
  type EndOfDayReviewIdleGap,
  type EndOfDayReviewPageData,
  type EndOfDayReviewTagIssue,
} from "@/lib/types/end_of_day_review";
import { type SerializedEntry } from "@/lib/types/tracker_state";
import { use_duration_format } from "@/lib/use_duration_format";
import { use_time_format } from "@/lib/use_time_format";

interface EndOfDayReviewViewProps {
  initial_data: EndOfDayReviewPageData;
}

type PanelId = "running" | "long" | "gaps" | "tags" | "notes";

const section_class =
  "w-full rounded-md border border-panel-border bg-panel p-4 shadow-sm";

/**
 * Guided checklist for reviewing and cleaning up today's tracked time.
 */
export function EndOfDayReviewView({
  initial_data,
}: Readonly<EndOfDayReviewViewProps>) {
  const router = useRouter();
  const [data, setData] = useState(initial_data);
  const [active_panel, setActive_panel] = useState<PanelId>("running");
  const [error, setError] = useState<string | null>(null);
  const [status_message, setStatus_message] = useState<string | null>(null);
  const [is_pending, setIs_pending] = useState(false);

  useEffect(() => {
    setData(initial_data);
  }, [initial_data]);

  const reviewed_count = useMemo(() => {
    return [
      data.runningEntries.length === 0,
      data.longEntries.length === 0,
      data.idleGaps.length === 0,
      data.tagIssues.length === 0,
    ].filter(Boolean).length;
  }, [data]);

  const run_action = async (
    action: () => Promise<unknown>,
    status: string,
  ): Promise<void> => {
    setIs_pending(true);
    setError(null);
    setStatus_message(null);

    try {
      await action();
      setStatus_message(status);
      router.refresh();
    } catch (action_error: unknown) {
      setError(
        message_from_unknown_error(action_error, "Review action failed"),
      );
    } finally {
      setIs_pending(false);
    }
  };

  return (
    <>
      <TrackerTopbar breadcrumb={{ current: "Review" }} />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 pb-12 pt-6">
        <header className="flex flex-col gap-2 text-center">
          <h1 className="m-0 text-[1.5rem] font-[650] tracking-tight">
            End-of-day review
          </h1>
          <p className="m-0 text-[0.9rem] leading-relaxed text-muted">
            {data.dateLabel}. Close timers, fill gaps, normalize tags, and add
            handoff notes.
          </p>
        </header>

        {error === null ? null : (
          <p className="m-0 rounded-md border border-danger-border bg-danger-soft px-3 py-2 text-[0.85rem] text-danger">
            {error}
          </p>
        )}
        {status_message === null ? null : (
          <p className="m-0 rounded-md border border-accent-border bg-accent-soft px-3 py-2 text-[0.85rem] text-accent">
            {status_message}
          </p>
        )}

        <section
          className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Review summary"
        >
          <SummaryCard
            label="Checklist"
            value={`${reviewed_count}/4 clear`}
            tone={reviewed_count === 4 ? "accent" : "default"}
          />
          <SummaryCard
            label="Running"
            value={String(data.runningEntries.length)}
            tone={data.runningEntries.length > 0 ? "danger" : "accent"}
          />
          <SummaryCard
            label="Entries today"
            value={String(data.entries.length)}
          />
          <SummaryCard
            label="Gaps"
            value={String(data.idleGaps.length)}
            tone={data.idleGaps.length > 0 ? "warning" : "accent"}
          />
        </section>

        <div className="grid grid-cols-[14rem_minmax(0,1fr)] gap-4 max-[760px]:grid-cols-1">
          <nav
            className="flex h-fit flex-col gap-1 rounded-md border border-panel-border bg-panel p-1.5 shadow-sm"
            aria-label="Review sections"
          >
            <PanelButton
              label="Running timers"
              count={data.runningEntries.length}
              active={active_panel === "running"}
              on_click={() => setActive_panel("running")}
            />
            <PanelButton
              label="Long entries"
              count={data.longEntries.length}
              active={active_panel === "long"}
              on_click={() => setActive_panel("long")}
            />
            <PanelButton
              label="Idle gaps"
              count={data.idleGaps.length}
              active={active_panel === "gaps"}
              on_click={() => setActive_panel("gaps")}
            />
            <PanelButton
              label="Tags"
              count={data.tagIssues.length}
              active={active_panel === "tags"}
              on_click={() => setActive_panel("tags")}
            />
            <PanelButton
              label="Notes"
              count={data.entries.length}
              active={active_panel === "notes"}
              on_click={() => setActive_panel("notes")}
            />
          </nav>

          <div className="min-w-0">
            {active_panel === "running" ? (
              <RunningTimersPanel
                entries={data.runningEntries}
                is_pending={is_pending}
                on_close={(entry, at, note) =>
                  run_action(
                    () =>
                      post_tracker_action(
                        "/api/out",
                        build_check_out_request_payload(entry.sheetName, {
                          at,
                          note,
                        }),
                      ),
                    "Timer closed.",
                  )
                }
              />
            ) : null}

            {active_panel === "long" ? (
              <LongEntriesPanel
                entries={data.longEntries}
                threshold_ms={data.longEntryThresholdMs}
                known_tags={data.knownTags}
                is_pending={is_pending}
                on_save={(entry, description, start, end) =>
                  run_action(
                    () =>
                      patch_tracker_action("/api/entry", {
                        sheetName: entry.sheetName,
                        entryId: entry.id,
                        description,
                        start,
                        end,
                      }),
                    "Entry updated.",
                  )
                }
              />
            ) : null}

            {active_panel === "gaps" ? (
              <IdleGapsPanel
                gaps={data.idleGaps}
                sheet_names={data.sheetNames}
                known_tags={data.knownTags}
                is_pending={is_pending}
                on_create={(gap, sheet_name, description, note) =>
                  run_action(
                    () =>
                      post_tracker_action("/api/entry/completed", {
                        sheetName: sheet_name,
                        description,
                        start: gap.start,
                        end: gap.end,
                        note,
                      }),
                    "Gap filled.",
                  )
                }
              />
            ) : null}

            {active_panel === "tags" ? (
              <TagIssuesPanel
                issues={data.tagIssues}
                known_tags={data.knownTags}
                is_pending={is_pending}
                on_save={(entry, description) =>
                  run_action(
                    () =>
                      patch_tracker_action("/api/entry", {
                        sheetName: entry.sheetName,
                        entryId: entry.id,
                        description,
                      }),
                    "Tags updated.",
                  )
                }
              />
            ) : null}

            {active_panel === "notes" ? (
              <NotesPanel
                entries={data.entries}
                is_pending={is_pending}
                on_add_note={(entry, text, at) =>
                  run_action(
                    () =>
                      post_tracker_action("/api/note", {
                        sheetName: entry.sheetName,
                        entryId: entry.id,
                        text,
                        at,
                      }),
                    "Note added.",
                  )
                }
              />
            ) : null}
          </div>
        </div>
      </main>
    </>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  tone?: "default" | "accent" | "danger" | "warning";
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: Readonly<SummaryCardProps>) {
  const value_class = get_summary_card_value_class(tone);

  return (
    <article className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
      <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
        {label}
      </p>
      <p className={`m-0 mt-1 text-[1.1rem] font-[650] ${value_class}`}>
        {value}
      </p>
    </article>
  );
}

function get_summary_card_value_class(tone: SummaryCardProps["tone"]): string {
  if (tone === "accent") {
    return "text-accent";
  }

  if (tone === "danger") {
    return "text-danger";
  }

  return "text-foreground";
}

interface PanelButtonProps {
  label: string;
  count: number;
  active: boolean;
  on_click: () => void;
}

function PanelButton({
  label,
  count,
  active,
  on_click,
}: Readonly<PanelButtonProps>) {
  return (
    <button
      type="button"
      className={`flex cursor-pointer items-center justify-between gap-2 rounded-md border-0 px-2.5 py-2 text-left font-inherit text-[0.86rem] ${
        active
          ? "bg-accent-soft text-foreground"
          : "bg-transparent text-muted hover:bg-surface-hover hover:text-foreground"
      }`}
      onClick={on_click}
    >
      <span className="font-semibold">{label}</span>
      <span className="rounded-full bg-background px-2 py-0.5 text-[0.72rem] text-muted">
        {count}
      </span>
    </button>
  );
}

interface RunningTimersPanelProps {
  entries: SerializedEntry[];
  is_pending: boolean;
  on_close: (entry: SerializedEntry, at?: string, note?: string) => void;
}

function RunningTimersPanel({
  entries,
  is_pending,
  on_close,
}: Readonly<RunningTimersPanelProps>) {
  return (
    <section className={section_class} aria-label="Running timers">
      <PanelHeader
        title="Close running timers"
        description="Set an end time and optional checkout note before wrapping the day."
      />
      {entries.length === 0 ? (
        <EmptyState message="No timers are running." />
      ) : (
        <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
          {entries.map((entry) => (
            <RunningTimerRow
              key={`${entry.sheetName}-${entry.id}`}
              entry={entry}
              is_pending={is_pending}
              on_close={on_close}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function RunningTimerRow({
  entry,
  is_pending,
  on_close,
}: Readonly<{
  entry: SerializedEntry;
  is_pending: boolean;
  on_close: (entry: SerializedEntry, at?: string, note?: string) => void;
}>) {
  const [at, setAt] = useState("");
  const [note, setNote] = useState("");
  const duration_format = use_duration_format();
  const time_format = use_time_format();

  return (
    <li className="rounded-md border border-panel-border bg-background p-3">
      <EntryHeading entry={entry} duration_ms={entry.durationMs} />
      <p className="m-0 mt-1 text-[0.8rem] text-muted">
        Started {format_time(entry.start, time_format)}. Running for{" "}
        {format_duration(entry.durationMs, duration_format)}.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <input
          className={get_input_class_name("compact")}
          value={at}
          disabled={is_pending}
          placeholder="End time, e.g. now or 5pm"
          aria-label="Checkout time"
          onChange={(event) => setAt(event.target.value)}
        />
        <input
          className={get_input_class_name("compact")}
          value={note}
          disabled={is_pending}
          placeholder="Checkout note"
          aria-label="Checkout note"
          onChange={(event) => setNote(event.target.value)}
        />
        <button
          type="button"
          className={get_button_class_name("primary", "small")}
          disabled={is_pending}
          onClick={() =>
            on_close(
              entry,
              at.trim().length > 0 ? at.trim() : undefined,
              note.trim().length > 0 ? note.trim() : undefined,
            )
          }
        >
          Close timer
        </button>
      </div>
    </li>
  );
}

interface LongEntriesPanelProps {
  entries: EndOfDayReviewEntry[];
  threshold_ms: number;
  known_tags: string[];
  is_pending: boolean;
  on_save: (
    entry: EndOfDayReviewEntry,
    description?: string,
    start?: string,
    end?: string,
  ) => void;
}

function LongEntriesPanel({
  entries,
  threshold_ms,
  known_tags,
  is_pending,
  on_save,
}: Readonly<LongEntriesPanelProps>) {
  const duration_format = use_duration_format();

  return (
    <section className={section_class} aria-label="Long entries">
      <PanelHeader
        title="Review suspiciously long entries"
        description={`Entries at or above ${format_duration(
          threshold_ms,
          duration_format,
        )} are listed here for correction.`}
      />
      {entries.length === 0 ? (
        <EmptyState message="No long entries need review." />
      ) : (
        <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
          {entries.map((entry) => (
            <EntryCleanupRow
              key={`${entry.sheetName}-${entry.id}`}
              entry={entry}
              known_tags={known_tags}
              is_pending={is_pending}
              show_times
              on_save={on_save}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

interface IdleGapsPanelProps {
  gaps: EndOfDayReviewIdleGap[];
  sheet_names: string[];
  known_tags: string[];
  is_pending: boolean;
  on_create: (
    gap: EndOfDayReviewIdleGap,
    sheet_name: string,
    description: string,
    note?: string,
  ) => void;
}

function IdleGapsPanel({
  gaps,
  sheet_names,
  known_tags,
  is_pending,
  on_create,
}: Readonly<IdleGapsPanelProps>) {
  return (
    <section className={section_class} aria-label="Idle gaps">
      <PanelHeader
        title="Fill idle gaps"
        description="Create completed entries for untracked time between today's logged blocks."
      />
      {gaps.length === 0 ? (
        <EmptyState message="No idle gaps found between entries." />
      ) : (
        <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
          {gaps.map((gap) => (
            <IdleGapRow
              key={gap.id}
              gap={gap}
              sheet_names={sheet_names}
              known_tags={known_tags}
              is_pending={is_pending}
              on_create={on_create}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function IdleGapRow({
  gap,
  sheet_names,
  known_tags,
  is_pending,
  on_create,
}: Readonly<{
  gap: EndOfDayReviewIdleGap;
  sheet_names: string[];
  known_tags: string[];
  is_pending: boolean;
  on_create: (
    gap: EndOfDayReviewIdleGap,
    sheet_name: string,
    description: string,
    note?: string,
  ) => void;
}>) {
  const time_format = use_time_format();
  const duration_format = use_duration_format();
  const default_sheet = gap.previousEntry?.sheetName ?? sheet_names[0] ?? "";
  const [sheet_name, setSheet_name] = useState(default_sheet);
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");

  return (
    <li className="rounded-md border border-panel-border bg-background p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="m-0 font-semibold">
          {format_time(gap.start, time_format)} to{" "}
          {format_time(gap.end, time_format)}
        </p>
        <span className="font-mono text-[0.86rem] font-semibold text-accent">
          {format_duration(gap.durationMs, duration_format)}
        </span>
      </div>
      <p className="m-0 mt-1 text-[0.8rem] text-muted">
        Between {gap.previousEntry?.description || "the previous entry"} and{" "}
        {gap.nextEntry?.description || "the next entry"}.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-[11rem_minmax(0,1fr)]">
        <select
          className={get_input_class_name("compact")}
          value={sheet_name}
          disabled={is_pending}
          aria-label="Gap sheet"
          onChange={(event) => setSheet_name(event.target.value)}
        >
          {sheet_names.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <TagAutocompleteInput
          id={`gap-description-${gap.id}`}
          value={description}
          known_tags={known_tags}
          placeholder="What filled this gap? Add @tags"
          disabled={is_pending}
          on_change={setDescription}
        />
        <input
          className={`${get_input_class_name("compact")} md:col-span-2`}
          value={note}
          disabled={is_pending}
          placeholder="Optional note"
          aria-label="Gap note"
          onChange={(event) => setNote(event.target.value)}
        />
      </div>
      <button
        type="button"
        className={`${get_button_class_name("primary", "small")} mt-3`}
        disabled={
          is_pending ||
          sheet_name.length === 0 ||
          description.trim().length === 0
        }
        onClick={() =>
          on_create(
            gap,
            sheet_name,
            description.trim(),
            note.trim().length > 0 ? note.trim() : undefined,
          )
        }
      >
        Create entry
      </button>
    </li>
  );
}

interface TagIssuesPanelProps {
  issues: EndOfDayReviewTagIssue[];
  known_tags: string[];
  is_pending: boolean;
  on_save: (entry: EndOfDayReviewEntry, description: string) => void;
}

function TagIssuesPanel({
  issues,
  known_tags,
  is_pending,
  on_save,
}: Readonly<TagIssuesPanelProps>) {
  return (
    <section className={section_class} aria-label="Tag issues">
      <PanelHeader
        title="Normalize tags"
        description="Add missing tags and clean up tag casing on today's entries."
      />
      {issues.length === 0 ? (
        <EmptyState message="No tag cleanup needed." />
      ) : (
        <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
          {issues.map((issue) => (
            <EntryCleanupRow
              key={`${issue.entry.sheetName}-${issue.entry.id}`}
              entry={issue.entry}
              known_tags={known_tags}
              is_pending={is_pending}
              issue_label={format_tag_issue_label(issue)}
              on_save={(entry, description) => {
                if (description !== undefined) {
                  on_save(entry, description);
                }
              }}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function EntryCleanupRow({
  entry,
  known_tags,
  is_pending,
  issue_label,
  show_times = false,
  on_save,
}: Readonly<{
  entry: EndOfDayReviewEntry;
  known_tags: string[];
  is_pending: boolean;
  issue_label?: string;
  show_times?: boolean;
  on_save: (
    entry: EndOfDayReviewEntry,
    description?: string,
    start?: string,
    end?: string,
  ) => void;
}>) {
  const [description, setDescription] = useState(
    build_resume_description(entry.description, entry.tags),
  );
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const has_changes =
    description.trim() !==
      build_resume_description(entry.description, entry.tags).trim() ||
    start.trim().length > 0 ||
    end.trim().length > 0;

  return (
    <li className="rounded-md border border-panel-border bg-background p-3">
      <EntryHeading entry={entry} duration_ms={entry.reviewDurationMs} />
      {issue_label === undefined ? null : (
        <p className="m-0 mt-1 text-[0.8rem] text-muted">{issue_label}</p>
      )}
      <div className="mt-3 flex flex-col gap-2">
        <TagAutocompleteInput
          id={`review-entry-${entry.sheetName}-${entry.id}`}
          value={description}
          known_tags={known_tags}
          disabled={is_pending}
          placeholder="Description with @tags"
          on_change={setDescription}
        />
        {show_times ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              className={get_input_class_name("compact")}
              value={start}
              disabled={is_pending}
              placeholder={`Start: ${format_datetime_hint(entry.start)}`}
              aria-label="Entry start"
              onChange={(event) => setStart(event.target.value)}
            />
            <input
              className={get_input_class_name("compact")}
              value={end}
              disabled={is_pending}
              placeholder={
                entry.end === null
                  ? "End: still running"
                  : `End: ${format_datetime_hint(entry.end)}`
              }
              aria-label="Entry end"
              onChange={(event) => setEnd(event.target.value)}
            />
          </div>
        ) : null}
        <button
          type="button"
          className={`${get_button_class_name("primary", "small")} w-fit`}
          disabled={is_pending || !has_changes}
          onClick={() =>
            on_save(
              entry,
              description.trim(),
              start.trim().length > 0 ? start.trim() : undefined,
              end.trim().length > 0 ? end.trim() : undefined,
            )
          }
        >
          Save changes
        </button>
      </div>
    </li>
  );
}

interface NotesPanelProps {
  entries: EndOfDayReviewEntry[];
  is_pending: boolean;
  on_add_note: (entry: EndOfDayReviewEntry, text: string, at?: string) => void;
}

function NotesPanel({
  entries,
  is_pending,
  on_add_note,
}: Readonly<NotesPanelProps>) {
  return (
    <section className={section_class} aria-label="Review notes">
      <PanelHeader
        title="Add handoff notes"
        description="Attach details to entries while the work is still fresh."
      />
      {entries.length === 0 ? (
        <EmptyState message="No entries today." />
      ) : (
        <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
          {entries.map((entry) => (
            <li
              key={`${entry.sheetName}-${entry.id}`}
              className="rounded-md border border-panel-border bg-background p-3"
            >
              <EntryHeading
                entry={entry}
                duration_ms={entry.reviewDurationMs}
              />
              {entry.notes.length > 0 ? (
                <p className="m-0 mt-1 text-[0.8rem] text-muted">
                  {entry.notes.length}{" "}
                  {entry.notes.length === 1 ? "note" : "notes"} already added.
                </p>
              ) : null}
              <div className="mt-3">
                <NoteForm
                  is_pending={is_pending}
                  allow_at
                  on_submit={(text, at) => on_add_note(entry, text, at)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EntryHeading({
  entry,
  duration_ms,
}: Readonly<{
  entry: EndOfDayReviewEntry | SerializedEntry;
  duration_ms: number;
}>) {
  const duration_format = use_duration_format();

  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-muted">
          {entry.sheetName}
        </p>
        <p className="m-0 mt-1 text-[0.95rem] font-semibold">
          {entry.description || "Untitled entry"}
        </p>
        {entry.tags.length > 0 ? (
          <ul className="m-0 mt-2 flex list-none flex-wrap gap-1.5 p-0">
            {entry.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-tag-bg px-2 py-0.5 text-xs text-tag-text"
              >
                {format_display_tag(tag)}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <span className="shrink-0 font-mono text-[0.88rem] font-semibold text-accent">
        {format_duration(duration_ms, duration_format)}
      </span>
    </div>
  );
}

function PanelHeader({
  title,
  description,
}: Readonly<{ title: string; description: string }>) {
  return (
    <header>
      <h2 className="m-0 text-[1rem] font-semibold">{title}</h2>
      <p className="m-0 mt-1 text-[0.86rem] leading-relaxed text-muted">
        {description}
      </p>
    </header>
  );
}

function EmptyState({ message }: Readonly<{ message: string }>) {
  return <p className="m-0 mt-4 text-[0.9rem] text-muted">{message}</p>;
}

function format_tag_issue_label(issue: EndOfDayReviewTagIssue): string {
  const labels = issue.kinds.map((kind) =>
    kind === "missing_tags" ? "Missing tags" : "Tag casing differs",
  );

  return labels.join(" and ");
}
