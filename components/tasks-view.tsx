"use client";

import { useMemo, useState } from "react";

import { Checkbox } from "@/components/checkbox";
import { TagAutocompleteInput } from "@/components/tag-autocomplete-input";
import { TrackerTopbar } from "@/components/tracker-topbar";
import { format_unknown_error } from "@/lib/format_unknown_error";
import { notify_tracker_db_cloud_sync } from "@/lib/notify_tracker_db_cloud_sync";
import { type SerializedTask, type TasksPageData } from "@/lib/types/task";

interface TasksViewProps {
  initial_data: TasksPageData;
}

const action_button_class =
  "inline-flex min-h-8 items-center justify-center rounded-md border border-panel-border bg-panel px-3 text-[0.8rem] font-semibold text-foreground transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60";

const primary_button_class =
  "inline-flex min-h-9 items-center justify-center rounded-md border border-accent bg-accent px-4 text-[0.85rem] font-semibold text-accent-text-on transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60";

const danger_button_class =
  "inline-flex min-h-8 items-center justify-center rounded-md border border-danger-border bg-danger-soft px-3 text-[0.8rem] font-semibold text-danger-text transition-colors hover:bg-danger-border disabled:cursor-not-allowed disabled:opacity-60";

async function parse_task_response(response: Response): Promise<TasksPageData> {
  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error ?? "Request failed");
  }

  return (await response.json()) as TasksPageData;
}

function format_task_date(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

/**
 * Client task manager for sheet-scoped task lists.
 */
export function TasksView({
  initial_data,
}: Readonly<TasksViewProps>): React.ReactElement {
  const [data, setData] = useState(initial_data);
  const [selected_sheet_name, setSelected_sheet_name] = useState(
    initial_data.activeSheetName ?? initial_data.sheets[0]?.name ?? "",
  );
  const [title, setTitle] = useState("");
  const [editing_task_id, setEditing_task_id] = useState<string | null>(null);
  const [editing_title, setEditing_title] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [is_pending, setIs_pending] = useState(false);

  const selected_sheet =
    data.sheets.find((sheet) => sheet.name === selected_sheet_name) ??
    data.sheets[0] ??
    null;
  const active_sheet_name = selected_sheet?.name ?? "";

  const visible_tasks = useMemo(
    () => data.tasks.filter((task) => task.sheetName === active_sheet_name),
    [active_sheet_name, data.tasks],
  );
  const open_tasks = visible_tasks.filter((task) => task.completedAt === null);
  const completed_tasks = visible_tasks.filter(
    (task) => task.completedAt !== null,
  );

  const run_task_request = async (
    method: "POST" | "PATCH" | "DELETE",
    body: unknown,
  ): Promise<TasksPageData> => {
    const response = await fetch("/api/task", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const next_data = await parse_task_response(response);

    notify_tracker_db_cloud_sync("/api/task", body);

    return next_data;
  };

  const run_action = async (
    action: () => Promise<TasksPageData | void>,
  ): Promise<void> => {
    setIs_pending(true);
    setError(null);

    try {
      const next_data = await action();

      if (next_data !== undefined) {
        setData(next_data);
      }
    } catch (action_error: unknown) {
      setError(format_unknown_error(action_error));
    } finally {
      setIs_pending(false);
    }
  };

  const create_task = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    void run_action(async () => {
      const next_data = await run_task_request("POST", {
        sheetName: active_sheet_name,
        title,
      });

      setTitle("");
      return next_data;
    });
  };

  const save_task_title = (
    event: React.FormEvent<HTMLFormElement>,
    task: SerializedTask,
  ): void => {
    event.preventDefault();

    void run_action(async () => {
      const next_data = await run_task_request("PATCH", {
        sheetName: task.sheetName,
        taskId: task.id,
        title: editing_title,
      });

      setEditing_task_id(null);
      setEditing_title("");
      return next_data;
    });
  };

  const track_task = (task: SerializedTask): void => {
    void run_action(async () => {
      const response = await fetch("/api/in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetName: task.sheetName,
          description: task.title,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Could not start timer");
      }

      notify_tracker_db_cloud_sync("/api/in", {
        sheetName: task.sheetName,
        description: task.title,
      });

      setData((current) => ({
        ...current,
        sheets: current.sheets.map((sheet) =>
          sheet.name === task.sheetName
            ? { ...sheet, hasActiveEntry: true }
            : sheet,
        ),
      }));
    });
  };

  const render_task = (task: SerializedTask): React.ReactElement => {
    const is_editing = editing_task_id === task.id;
    const is_completed = task.completedAt !== null;
    const task_sheet = data.sheets.find(
      (sheet) => sheet.name === task.sheetName,
    );
    const has_active_entry_on_sheet = task_sheet?.hasActiveEntry === true;

    return (
      <li
        key={task.id}
        className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 border border-panel-border bg-panel p-3 shadow-sm max-[640px]:grid-cols-[auto_minmax(0,1fr)]"
      >
        <Checkbox
          checked={is_completed}
          disabled={is_pending}
          aria_label={is_completed ? "Mark task open" : "Mark task complete"}
          on_change={() => {
            void run_action(() =>
              run_task_request("PATCH", {
                sheetName: task.sheetName,
                taskId: task.id,
                completed: !is_completed,
              }),
            );
          }}
        />

        <div className="min-w-0">
          {is_editing ? (
            <form
              className="flex min-w-0 flex-wrap items-center gap-2"
              onSubmit={(event) => save_task_title(event, task)}
            >
              <div className="min-w-0 flex-1">
                <TagAutocompleteInput
                  id={`edit-task-${task.id}`}
                  value={editing_title}
                  known_tags={data.knownTags}
                  disabled={is_pending}
                  autoFocus
                  on_change={setEditing_title}
                />
              </div>
              <button
                type="submit"
                className={primary_button_class}
                disabled={is_pending || editing_title.trim().length === 0}
              >
                Save
              </button>
              <button
                type="button"
                className={action_button_class}
                disabled={is_pending}
                onClick={() => {
                  setEditing_task_id(null);
                  setEditing_title("");
                }}
              >
                Cancel
              </button>
            </form>
          ) : (
            <p
              className={`m-0 break-words text-[0.95rem] font-medium leading-snug ${
                is_completed ? "text-muted line-through" : "text-foreground"
              }`}
            >
              {task.title}
            </p>
          )}
          <p className="m-0 mt-1 text-[0.75rem] text-muted">
            {is_completed && task.completedAt !== null
              ? `Completed ${format_task_date(task.completedAt)}`
              : `Created ${format_task_date(task.createdAt)}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 max-[640px]:col-span-2 max-[640px]:justify-start">
          <button
            type="button"
            className={action_button_class}
            disabled={is_pending || is_completed || has_active_entry_on_sheet}
            onClick={() => track_task(task)}
            title={
              has_active_entry_on_sheet
                ? "This sheet already has an active entry"
                : undefined
            }
          >
            Track
          </button>
          <button
            type="button"
            className={action_button_class}
            disabled={is_pending}
            onClick={() => {
              setEditing_task_id(task.id);
              setEditing_title(task.title);
            }}
          >
            Edit
          </button>
          <select
            className="min-h-8 rounded-md border border-panel-border bg-input-bg px-2 text-[0.8rem] text-foreground"
            aria-label="Move task to sheet"
            value={task.sheetName}
            disabled={is_pending}
            onChange={(event) => {
              const target_sheet_name = event.target.value;

              setSelected_sheet_name(target_sheet_name);
              void run_action(() =>
                run_task_request("PATCH", {
                  sheetName: task.sheetName,
                  taskId: task.id,
                  targetSheetName: target_sheet_name,
                }),
              );
            }}
          >
            {data.sheets.map((sheet) => (
              <option key={sheet.name} value={sheet.name}>
                {sheet.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={danger_button_class}
            disabled={is_pending}
            onClick={() => {
              void run_action(() =>
                run_task_request("DELETE", {
                  sheetName: task.sheetName,
                  taskId: task.id,
                }),
              );
            }}
          >
            Delete
          </button>
        </div>
      </li>
    );
  };

  return (
    <>
      <TrackerTopbar breadcrumb={{ current: "Tasks" }} />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-5 pb-12 pt-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="m-0 text-[1.5rem] font-[650] tracking-tight">
              Tasks
            </h1>
            {selected_sheet === null ? null : (
              <p className="m-0 mt-1 text-[0.85rem] text-muted">
                {selected_sheet.openTaskCount} open / {selected_sheet.taskCount}{" "}
                total
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {data.sheets.map((sheet) => (
              <button
                key={sheet.name}
                type="button"
                className={`rounded-full px-3 py-1.5 text-[0.82rem] font-semibold transition-colors ${
                  sheet.name === active_sheet_name
                    ? "bg-accent-soft text-foreground"
                    : "text-muted hover:bg-surface-hover hover:text-foreground"
                }`}
                onClick={() => setSelected_sheet_name(sheet.name)}
              >
                {sheet.name}
                {sheet.openTaskCount > 0 ? ` (${sheet.openTaskCount})` : ""}
              </button>
            ))}
          </div>
        </header>

        {error === null ? null : (
          <p className="m-0 border border-danger-border bg-danger-soft px-3 py-2.5 text-danger-text">
            {error}
          </p>
        )}

        {selected_sheet === null ? (
          <p className="m-0 text-[0.9rem] text-muted">No sheets available.</p>
        ) : (
          <>
            <form
              className="flex min-w-0 flex-wrap items-center gap-2 border border-panel-border bg-panel p-3 shadow-sm"
              onSubmit={create_task}
            >
              <div className="min-w-0 flex-1">
                <TagAutocompleteInput
                  id="new-task-title"
                  value={title}
                  known_tags={data.knownTags}
                  disabled={is_pending}
                  placeholder={`Task for ${active_sheet_name}`}
                  on_change={setTitle}
                />
              </div>
              <button
                type="submit"
                className={primary_button_class}
                disabled={is_pending || title.trim().length === 0}
              >
                Add Task
              </button>
            </form>

            <section className="flex flex-col gap-3">
              <h2 className="m-0 text-[0.95rem] font-semibold">Open</h2>
              {open_tasks.length === 0 ? (
                <p className="m-0 border border-dashed border-panel-border px-3 py-6 text-center text-[0.9rem] text-muted">
                  No open tasks.
                </p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {open_tasks.map(render_task)}
                </ul>
              )}
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="m-0 text-[0.95rem] font-semibold">Completed</h2>
              {completed_tasks.length === 0 ? (
                <p className="m-0 border border-dashed border-panel-border px-3 py-6 text-center text-[0.9rem] text-muted">
                  No completed tasks.
                </p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {completed_tasks.map(render_task)}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}
