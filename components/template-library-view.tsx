"use client";

import { useRouter } from "next/navigation";
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { SaveIcon } from "@/components/save-icon";
import { TagAutocompleteInput } from "@/components/tag-autocomplete-input";
import { TrackerTopbar } from "@/components/tracker-topbar";
import { TrashIcon } from "@/components/trash-icon";
import { build_entry_template_description } from "@/lib/build_entry_template_description";
import { format_display_tag } from "@/lib/format_display_tag";
import { get_button_class_name } from "@/lib/get_button_class_name";
import { get_input_class_name } from "@/lib/get_input_class_name";
import { get_select_class_name } from "@/lib/get_select_class_name";
import { normalize_entry_template_shortcut_key } from "@/lib/normalize_entry_template_shortcut_key";
import { post_tracker_action } from "@/lib/post_tracker_action";
import { record_entry_template_usage } from "@/lib/record_entry_template_usage";
import {
  POMODORO_DEFAULT_SETTINGS,
  POMODORO_DEFAULT_STATE,
  POMODORO_STORAGE_KEY,
  type PomodoroStorageRecord,
} from "@/lib/types/pomodoro";
import { type EntryTemplate } from "@/lib/types/entry_template";
import { type TemplateLibraryPageData } from "@/lib/get_template_library_page_data";
import { use_entry_templates } from "@/lib/use_entry_templates";
import { write_entry_templates } from "@/lib/write_entry_templates";

interface TemplateLibraryViewProps {
  initial_data: TemplateLibraryPageData;
}

interface TemplateDraft {
  id: string | null;
  name: string;
  description: string;
  defaultSheetName: string;
  tagsText: string;
  favorite: boolean;
  shortcutKey: string;
  pomodoroLinked: boolean;
}

const empty_draft: TemplateDraft = {
  id: null,
  name: "",
  description: "",
  defaultSheetName: "",
  tagsText: "",
  favorite: false,
  shortcutKey: "",
  pomodoroLinked: false,
};

const panel_class = "rounded-md border border-panel-border bg-panel shadow-sm";

/**
 * Local template manager with favorites, recents, shortcuts, and Pomodoro links.
 */
export function TemplateLibraryView({
  initial_data,
}: Readonly<TemplateLibraryViewProps>) {
  const router = useRouter();
  const templates = use_entry_templates();
  const [draft, setDraft] = useState<TemplateDraft>(empty_draft);
  const [query, setQuery] = useState("");
  const [status_message, setStatus_message] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [is_pending, setIs_pending] = useState(false);

  const sorted_templates = useMemo(
    () => sort_templates([...templates]),
    [templates],
  );
  const filtered_templates = useMemo(() => {
    const normalized_query = query.trim().toLowerCase();

    if (normalized_query.length === 0) {
      return sorted_templates;
    }

    return sorted_templates.filter((template) =>
      [
        template.name,
        template.description,
        template.defaultSheetName ?? "",
        ...(template.tags ?? []),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized_query),
    );
  }, [query, sorted_templates]);
  const favorite_templates = sorted_templates.filter(
    (template) => template.favorite === true,
  );
  const recent_templates = sorted_templates
    .filter((template) => template.lastUsedAt !== undefined)
    .sort((left, right) =>
      compare_optional_date(right.lastUsedAt, left.lastUsedAt),
    )
    .slice(0, 5);
  const shortcut_templates = sorted_templates.filter(
    (template) => template.shortcutKey !== undefined,
  );
  const pomodoro_templates = sorted_templates.filter(
    (template) => template.pomodoroLinked === true,
  );

  const start_template = useCallback(
    async (template: EntryTemplate): Promise<void> => {
      const description = build_entry_template_description(template);

      if (description.trim().length === 0) {
        return;
      }

      setIs_pending(true);
      setError(null);
      setStatus_message(null);

      try {
        await post_tracker_action("/api/in", {
          description,
          ...(template.defaultSheetName !== undefined
            ? { sheetName: template.defaultSheetName }
            : {}),
        });
        record_entry_template_usage(template.id);
        setStatus_message(`Checked in with ${template.name}.`);
        router.refresh();
      } catch (start_error: unknown) {
        setError(
          start_error instanceof Error
            ? start_error.message
            : String(start_error),
        );
      } finally {
        setIs_pending(false);
      }
    },
    [router],
  );

  useEffect(() => {
    const handle_key_down = (event: KeyboardEvent): void => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      const key = normalize_entry_template_shortcut_key(event.key);

      if (key === undefined) {
        return;
      }

      const template = templates.find(
        (item) => item.shortcutKey?.toLowerCase() === key,
      );

      if (template === undefined) {
        return;
      }

      event.preventDefault();
      void start_template(template);
    };

    window.addEventListener("keydown", handle_key_down);

    return () => {
      window.removeEventListener("keydown", handle_key_down);
    };
  }, [start_template, templates]);

  const reset_draft = (): void => {
    setDraft(empty_draft);
    setError(null);
  };

  const edit_template = (template: EntryTemplate): void => {
    setDraft({
      id: template.id,
      name: template.name,
      description: template.description,
      defaultSheetName: template.defaultSheetName ?? "",
      tagsText: (template.tags ?? []).map(format_display_tag).join(" "),
      favorite: template.favorite === true,
      shortcutKey: template.shortcutKey ?? "",
      pomodoroLinked: template.pomodoroLinked === true,
    });
    setError(null);
  };

  const save_template = (): void => {
    const name = draft.name.trim();
    const description = draft.description.trim();
    const tags = parse_tags(draft.tagsText);
    const shortcut_key =
      draft.shortcutKey.trim().length === 0
        ? undefined
        : normalize_entry_template_shortcut_key(draft.shortcutKey);

    if (name.length === 0 || description.length === 0) {
      setError("Template name and description are required.");
      return;
    }

    if (draft.shortcutKey.trim().length > 0 && shortcut_key === undefined) {
      setError("Shortcut must be one letter or number.");
      return;
    }

    const duplicate_shortcut = shortcut_key
      ? templates.find(
          (template) =>
            template.id !== draft.id &&
            template.shortcutKey?.toLowerCase() === shortcut_key,
        )
      : undefined;

    if (duplicate_shortcut !== undefined) {
      setError(`Shortcut already belongs to ${duplicate_shortcut.name}.`);
      return;
    }

    const id = draft.id ?? create_template_id();
    const now = new Date().toISOString();
    const existing = templates.find((template) => template.id === id);
    const next_template: EntryTemplate = {
      ...existing,
      id,
      name,
      description,
      ...(draft.defaultSheetName.length > 0
        ? { defaultSheetName: draft.defaultSheetName }
        : {}),
      ...(tags.length > 0 ? { tags } : {}),
      ...(draft.favorite ? { favorite: true } : {}),
      ...(shortcut_key !== undefined ? { shortcutKey: shortcut_key } : {}),
      ...(draft.pomodoroLinked ? { pomodoroLinked: true } : {}),
      createdAt: existing?.createdAt ?? now,
      ...(existing?.lastUsedAt !== undefined
        ? { lastUsedAt: existing.lastUsedAt }
        : {}),
      ...(existing?.useCount !== undefined
        ? { useCount: existing.useCount }
        : {}),
    };
    const next_templates =
      existing === undefined
        ? [...templates, next_template]
        : templates.map((template) =>
            template.id === id ? next_template : template,
          );

    write_entry_templates(next_templates);
    setDraft(empty_draft);
    setStatus_message("Template saved.");
    setError(null);
  };

  const delete_template = (template: EntryTemplate): void => {
    const confirmed = window.confirm(`Delete template "${template.name}"?`);

    if (!confirmed) {
      return;
    }

    write_entry_templates(
      templates.filter((candidate) => candidate.id !== template.id),
    );

    if (draft.id === template.id) {
      reset_draft();
    }

    setStatus_message("Template deleted.");
  };

  const toggle_favorite = (template: EntryTemplate): void => {
    write_entry_templates(
      templates.map((candidate) =>
        candidate.id === template.id
          ? { ...candidate, favorite: candidate.favorite !== true }
          : candidate,
      ),
    );
  };

  const use_for_pomodoro = (template: EntryTemplate): void => {
    const description = build_entry_template_description(template);
    const raw = window.localStorage.getItem(POMODORO_STORAGE_KEY);
    const existing =
      raw === null ? {} : (JSON.parse(raw) as Partial<PomodoroStorageRecord>);
    const next_record: PomodoroStorageRecord = {
      settings: {
        ...POMODORO_DEFAULT_SETTINGS,
        ...existing.settings,
        check_in_on_work_start: true,
        work_entry_description: description,
      },
      state: existing.state ?? POMODORO_DEFAULT_STATE,
    };

    window.localStorage.setItem(
      POMODORO_STORAGE_KEY,
      JSON.stringify(next_record),
    );
    setStatus_message(`Pomodoro will use ${template.name}.`);
  };

  return (
    <>
      <TrackerTopbar breadcrumb={{ current: "Templates" }} />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 pb-12 pt-6">
        <header className="flex flex-col gap-2 text-center">
          <h1 className="m-0 text-[1.5rem] font-[650] tracking-tight">
            Template library
          </h1>
          <p className="m-0 text-[0.9rem] leading-relaxed text-muted">
            Manage reusable check-ins with default sheets, tags, shortcuts, and
            Pomodoro defaults.
          </p>
        </header>

        {status_message === null ? null : (
          <p className="m-0 rounded-md border border-accent-border bg-accent-soft px-3 py-2 text-[0.85rem] text-accent">
            {status_message}
          </p>
        )}
        {error === null ? null : (
          <p className="m-0 rounded-md border border-danger-border bg-danger-soft px-3 py-2 text-[0.85rem] text-danger">
            {error}
          </p>
        )}

        <section
          className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Template summary"
        >
          <SummaryCard label="Templates" value={String(templates.length)} />
          <SummaryCard
            label="Favorites"
            value={String(favorite_templates.length)}
          />
          <SummaryCard
            label="Shortcuts"
            value={String(shortcut_templates.length)}
          />
          <SummaryCard
            label="Pomodoro"
            value={String(pomodoro_templates.length)}
          />
        </section>

        <div className="grid grid-cols-[minmax(17rem,21rem)_minmax(0,1fr)] gap-4 max-[860px]:grid-cols-1">
          <TemplateEditor
            draft={draft}
            sheet_names={initial_data.sheetNames}
            known_tags={initial_data.knownTags}
            on_change={setDraft}
            on_save={save_template}
            on_cancel={reset_draft}
          />

          <div className="flex min-w-0 flex-col gap-4">
            <section className={`${panel_class} p-3.5`}>
              <label className="flex flex-col gap-1.5">
                <span className="text-[0.85rem] font-semibold text-muted">
                  Search templates
                </span>
                <input
                  className={get_input_class_name()}
                  value={query}
                  placeholder="Filter by name, sheet, description, or tag"
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
            </section>

            {favorite_templates.length > 0 ? (
              <TemplateSection
                title="Favorites"
                templates={favorite_templates}
                is_pending={is_pending}
                on_start={(template) => void start_template(template)}
                on_edit={edit_template}
                on_delete={delete_template}
                on_toggle_favorite={toggle_favorite}
                on_use_for_pomodoro={use_for_pomodoro}
              />
            ) : null}

            {recent_templates.length > 0 ? (
              <TemplateSection
                title="Recent"
                templates={recent_templates}
                is_pending={is_pending}
                on_start={(template) => void start_template(template)}
                on_edit={edit_template}
                on_delete={delete_template}
                on_toggle_favorite={toggle_favorite}
                on_use_for_pomodoro={use_for_pomodoro}
              />
            ) : null}

            {pomodoro_templates.length > 0 ? (
              <TemplateSection
                title="Pomodoro-linked"
                templates={pomodoro_templates}
                is_pending={is_pending}
                on_start={(template) => void start_template(template)}
                on_edit={edit_template}
                on_delete={delete_template}
                on_toggle_favorite={toggle_favorite}
                on_use_for_pomodoro={use_for_pomodoro}
              />
            ) : null}

            <TemplateSection
              title={query.trim().length > 0 ? "Matches" : "All templates"}
              templates={filtered_templates}
              is_pending={is_pending}
              empty_message={
                templates.length === 0
                  ? "No templates yet. Create one to reuse common check-ins."
                  : "No templates match the current search."
              }
              on_start={(template) => void start_template(template)}
              on_edit={edit_template}
              on_delete={delete_template}
              on_toggle_favorite={toggle_favorite}
              on_use_for_pomodoro={use_for_pomodoro}
            />
          </div>
        </div>
      </main>
    </>
  );
}

function TemplateEditor({
  draft,
  sheet_names,
  known_tags,
  on_change,
  on_save,
  on_cancel,
}: Readonly<{
  draft: TemplateDraft;
  sheet_names: string[];
  known_tags: string[];
  on_change: (draft: TemplateDraft) => void;
  on_save: () => void;
  on_cancel: () => void;
}>) {
  const handle_submit: NonNullable<ComponentProps<"form">["onSubmit"]> = (
    event,
  ) => {
    event.preventDefault();
    on_save();
  };

  return (
    <form className={`${panel_class} h-fit p-4`} onSubmit={handle_submit}>
      <h2 className="m-0 text-[1rem] font-semibold">
        {draft.id === null ? "New template" : "Edit template"}
      </h2>
      <div className="mt-3 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.82rem] font-semibold text-muted">Name</span>
          <input
            className={get_input_class_name("compact")}
            value={draft.name}
            onChange={(event) =>
              on_change({ ...draft, name: event.target.value })
            }
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.82rem] font-semibold text-muted">
            Description
          </span>
          <TagAutocompleteInput
            id="template-description"
            value={draft.description}
            known_tags={known_tags}
            placeholder="e.g. Triage inbox"
            on_change={(value) => on_change({ ...draft, description: value })}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.82rem] font-semibold text-muted">
            Default sheet
          </span>
          <select
            className={get_select_class_name("compact")}
            value={draft.defaultSheetName}
            onChange={(event) =>
              on_change({ ...draft, defaultSheetName: event.target.value })
            }
          >
            <option value="">Active sheet</option>
            {sheet_names.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.82rem] font-semibold text-muted">
            Default tags
          </span>
          <TagAutocompleteInput
            id="template-tags"
            value={draft.tagsText}
            known_tags={known_tags}
            placeholder="@focus @client"
            on_change={(value) => on_change({ ...draft, tagsText: value })}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.82rem] font-semibold text-muted">
            Shortcut key
          </span>
          <input
            className={get_input_class_name("compact")}
            value={draft.shortcutKey}
            maxLength={1}
            placeholder="e.g. 1"
            onChange={(event) =>
              on_change({ ...draft, shortcutKey: event.target.value })
            }
          />
        </label>
        <label className="flex items-start gap-2.5 text-[0.86rem]">
          <input
            type="checkbox"
            className="mt-1 shrink-0"
            checked={draft.favorite}
            onChange={(event) =>
              on_change({ ...draft, favorite: event.target.checked })
            }
          />
          <span>Favorite</span>
        </label>
        <label className="flex items-start gap-2.5 text-[0.86rem]">
          <input
            type="checkbox"
            className="mt-1 shrink-0"
            checked={draft.pomodoroLinked}
            onChange={(event) =>
              on_change({ ...draft, pomodoroLinked: event.target.checked })
            }
          />
          <span>Show as Pomodoro template</span>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="submit" className={get_button_class_name("primary")}>
          <span className="inline-flex items-center gap-2">
            <SaveIcon />
            Save
          </span>
        </button>
        <button
          type="button"
          className={get_button_class_name("ghost")}
          onClick={on_cancel}
        >
          Clear
        </button>
      </div>
    </form>
  );
}

function TemplateSection({
  title,
  templates,
  is_pending,
  empty_message,
  on_start,
  on_edit,
  on_delete,
  on_toggle_favorite,
  on_use_for_pomodoro,
}: Readonly<{
  title: string;
  templates: readonly EntryTemplate[];
  is_pending: boolean;
  empty_message?: string;
  on_start: (template: EntryTemplate) => void;
  on_edit: (template: EntryTemplate) => void;
  on_delete: (template: EntryTemplate) => void;
  on_toggle_favorite: (template: EntryTemplate) => void;
  on_use_for_pomodoro: (template: EntryTemplate) => void;
}>) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
        {title}
      </h2>
      {templates.length === 0 ? (
        <p className="m-0 rounded-md border border-dashed border-panel-border bg-surface-raised/60 px-3.5 py-3 text-[0.9rem] text-muted">
          {empty_message ?? "No templates."}
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {templates.map((template) => (
            <TemplateRow
              key={template.id}
              template={template}
              is_pending={is_pending}
              on_start={on_start}
              on_edit={on_edit}
              on_delete={on_delete}
              on_toggle_favorite={on_toggle_favorite}
              on_use_for_pomodoro={on_use_for_pomodoro}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function TemplateRow({
  template,
  is_pending,
  on_start,
  on_edit,
  on_delete,
  on_toggle_favorite,
  on_use_for_pomodoro,
}: Readonly<{
  template: EntryTemplate;
  is_pending: boolean;
  on_start: (template: EntryTemplate) => void;
  on_edit: (template: EntryTemplate) => void;
  on_delete: (template: EntryTemplate) => void;
  on_toggle_favorite: (template: EntryTemplate) => void;
  on_use_for_pomodoro: (template: EntryTemplate) => void;
}>) {
  const description = build_entry_template_description(template);

  return (
    <li className={`${panel_class} p-3.5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="m-0 min-w-0 truncate text-[0.98rem] font-semibold">
              {template.name}
            </h3>
            {template.favorite === true ? (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[0.7rem] font-semibold text-accent">
                Favorite
              </span>
            ) : null}
            {template.shortcutKey !== undefined ? (
              <kbd className="rounded border border-panel-border bg-background px-1.5 py-0.5 font-mono text-[0.7rem] text-muted">
                {template.shortcutKey.toUpperCase()}
              </kbd>
            ) : null}
          </div>
          <p className="m-0 mt-1 text-[0.86rem] leading-relaxed">
            {description}
          </p>
          <p className="m-0 mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[0.78rem] text-muted">
            <span>{template.defaultSheetName ?? "Active sheet"}</span>
            <span>{template.useCount ?? 0} uses</span>
            {template.lastUsedAt === undefined ? null : (
              <span>Last used {format_short_date(template.lastUsedAt)}</span>
            )}
            {template.pomodoroLinked === true ? <span>Pomodoro</span> : null}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          <button
            type="button"
            className={get_button_class_name("primary", "small")}
            disabled={is_pending}
            onClick={() => on_start(template)}
          >
            Start
          </button>
          <button
            type="button"
            className={get_button_class_name("ghost", "small")}
            onClick={() => on_use_for_pomodoro(template)}
          >
            Pomodoro
          </button>
          <button
            type="button"
            className={get_button_class_name("ghost", "small")}
            onClick={() => on_toggle_favorite(template)}
          >
            {template.favorite === true ? "Unfavorite" : "Favorite"}
          </button>
          <button
            type="button"
            className={get_button_class_name("ghost", "small")}
            onClick={() => on_edit(template)}
          >
            Edit
          </button>
          <button
            type="button"
            className={get_button_class_name("danger", "small")}
            onClick={() => on_delete(template)}
            aria-label={`Delete ${template.name}`}
            title="Delete template"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </li>
  );
}

function SummaryCard({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <article className={panel_class + " p-3.5"}>
      <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
        {label}
      </p>
      <p className="m-0 mt-1 text-[1.1rem] font-[650] text-accent">{value}</p>
    </article>
  );
}

function parse_tags(value: string): string[] {
  const matches = value.match(/@?\w+/g) ?? [];
  const tags = matches.map((tag) => format_display_tag(tag.toLowerCase()));

  return Array.from(new Set(tags));
}

function create_template_id(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sort_templates(templates: EntryTemplate[]): EntryTemplate[] {
  return templates.sort((left, right) => {
    if (left.favorite !== right.favorite) {
      return left.favorite === true ? -1 : 1;
    }

    const recent_order = compare_optional_date(
      right.lastUsedAt,
      left.lastUsedAt,
    );

    if (recent_order !== 0) {
      return recent_order;
    }

    return left.name.localeCompare(right.name);
  });
}

function compare_optional_date(
  left: string | undefined,
  right: string | undefined,
): number {
  if (left === undefined && right === undefined) {
    return 0;
  }

  if (left === undefined) {
    return -1;
  }

  if (right === undefined) {
    return 1;
  }

  return Date.parse(left) - Date.parse(right);
}

function format_short_date(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
