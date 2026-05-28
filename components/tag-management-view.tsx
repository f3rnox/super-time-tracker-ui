"use client";

import { useMemo, useState } from "react";

import { useConfirmDialog } from "@/components/confirm-dialog-provider";
import { message_from_unknown_error } from "@/lib/message_from_unknown_error";
import { SettingsPageLayout } from "@/components/settings-page-layout";
import { TagAutocompleteInput } from "@/components/tag-autocomplete-input";
import { format_display_tag } from "@/lib/format_display_tag";
import { get_button_class_name } from "@/lib/get_button_class_name";
import { get_input_class_name } from "@/lib/get_input_class_name";
import { get_merge_tags_confirm_dialog } from "@/lib/get_merge_tags_confirm_dialog";
import { push_tracker_db_cloud_after_change } from "@/lib/push_tracker_db_cloud_after_change";
import { type TagStat } from "@/lib/types/tag_management";

interface TagManagementViewProps {
  initial_tags: TagStat[];
}

/**
 * Manages renaming and merging tags across all time entries.
 */
export function TagManagementView({
  initial_tags,
}: Readonly<TagManagementViewProps>) {
  const { confirm } = useConfirmDialog();
  const [tags, setTags] = useState<TagStat[]>(initial_tags);
  const [selected_tags, setSelected_tags] = useState<Set<string>>(
    () => new Set(),
  );
  const [rename_values, setRename_values] = useState<Record<string, string>>(
    {},
  );
  const [merge_target, setMerge_target] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status_message, setStatus_message] = useState<string | null>(null);
  const [is_pending, setIs_pending] = useState(false);

  const known_tag_names = useMemo(() => tags.map((tag) => tag.name), [tags]);

  const selected_tag_stats = tags.filter((tag) => selected_tags.has(tag.name));
  const selected_entry_count = selected_tag_stats.reduce(
    (total, tag) => total + tag.entryCount,
    0,
  );

  const toggle_selected = (tag_name: string): void => {
    setSelected_tags((previous) => {
      const next = new Set(previous);

      if (next.has(tag_name)) {
        next.delete(tag_name);
      } else {
        next.add(tag_name);
      }

      return next;
    });
  };

  const patch_tags = async (body: Record<string, unknown>): Promise<void> => {
    const response = await fetch("/api/tags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      throw new Error(payload.error ?? "Tag update failed");
    }

    const result = (await response.json()) as {
      tags: TagStat[];
      entries_updated: number;
    };

    setTags(result.tags);
    setSelected_tags(new Set());
    setStatus_message(
      result.entries_updated === 1
        ? "Updated 1 entry."
        : `Updated ${result.entries_updated} entries.`,
    );

    push_tracker_db_cloud_after_change();
  };

  const handle_rename = async (from_tag: string): Promise<void> => {
    const to_tag = rename_values[from_tag]?.trim() ?? "";

    if (to_tag.length === 0) {
      setError("Enter a new tag name.");
      return;
    }

    const source_stat = tags.find((tag) => tag.name === from_tag);

    if (source_stat === undefined) {
      return;
    }

    const target_stat = tags.find(
      (tag) => format_display_tag(tag.name) === format_display_tag(to_tag),
    );
    const affected_entries =
      target_stat !== undefined && target_stat.name !== from_tag
        ? source_stat.entryCount + target_stat.entryCount
        : source_stat.entryCount;

    const confirmed = await confirm(
      get_merge_tags_confirm_dialog([from_tag], to_tag, affected_entries),
    );

    if (!confirmed) {
      return;
    }

    setIs_pending(true);
    setError(null);
    setStatus_message(null);

    try {
      await patch_tags({
        action: "rename",
        fromTag: from_tag,
        toTag: to_tag,
      });
      setRename_values((previous) => {
        const next = { ...previous };
        delete next[from_tag];
        return next;
      });
    } catch (rename_error: unknown) {
      setError(message_from_unknown_error(rename_error, "Tag rename failed"));
    } finally {
      setIs_pending(false);
    }
  };

  const handle_merge = async (): Promise<void> => {
    const source_tags = [...selected_tags];

    if (source_tags.length < 2) {
      setError("Select at least two tags to merge.");
      return;
    }

    if (merge_target.trim().length === 0) {
      setError("Enter a target tag for the merge.");
      return;
    }

    const confirmed = await confirm(
      get_merge_tags_confirm_dialog(
        source_tags,
        merge_target,
        selected_entry_count,
      ),
    );

    if (!confirmed) {
      return;
    }

    setIs_pending(true);
    setError(null);
    setStatus_message(null);

    try {
      await patch_tags({
        action: "merge",
        sourceTags: source_tags,
        targetTag: merge_target,
      });
      setMerge_target("");
    } catch (merge_error: unknown) {
      setError(message_from_unknown_error(merge_error, "Tag merge failed"));
    } finally {
      setIs_pending(false);
    }
  };

  return (
    <SettingsPageLayout
      breadcrumb={{
        current: "Tag management",
        parent: { label: "Settings", href: "/settings" },
      }}
      title="Tag management"
      description="Rename or merge tags across every entry in your database."
    >
      <section className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
        <h2 className="m-0 text-[0.95rem] font-semibold">Merge tags</h2>
        <p className="m-0 mt-1 text-[0.8rem] leading-snug text-muted">
          Select two or more tags below, then choose the tag they should become.
        </p>
        <label className="mt-3 flex flex-col gap-1 text-[0.82rem] text-muted">
          Target tag
          <TagAutocompleteInput
            id="merge-target-tag"
            value={merge_target}
            known_tags={known_tag_names}
            placeholder="e.g. @project"
            disabled={is_pending}
            on_change={setMerge_target}
          />
        </label>
        <button
          type="button"
          className={`${get_button_class_name("primary", "small")} mt-3`}
          disabled={is_pending || selected_tags.size < 2}
          onClick={() => void handle_merge()}
        >
          Merge {selected_tags.size} tags
        </button>
      </section>

      {tags.length === 0 ? (
        <p className="m-0 text-[0.9rem] text-muted">
          No tags yet. Add @tags when you check in to an entry.
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0" aria-label="Tags">
          {tags.map((tag) => (
            <li
              key={tag.name}
              className="rounded-md border border-panel-border bg-panel px-3.5 py-2.5 shadow-sm"
            >
              <form
                className="flex flex-wrap items-center gap-x-3 gap-y-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handle_rename(tag.name);
                }}
              >
                <input
                  type="checkbox"
                  className="shrink-0"
                  checked={selected_tags.has(tag.name)}
                  disabled={is_pending}
                  aria-label={`Select ${format_display_tag(tag.name)}`}
                  onChange={() => toggle_selected(tag.name)}
                />
                <div className="flex min-w-0 shrink-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="font-semibold leading-tight">
                    {format_display_tag(tag.name)}
                  </span>
                  <span className="text-[0.82rem] text-muted">
                    {tag.entryCount}{" "}
                    {tag.entryCount === 1 ? "entry" : "entries"}
                  </span>
                </div>
                <div className="ml-auto flex min-w-[min(100%,14rem)] flex-1 basis-56 items-center justify-end gap-2 sm:max-w-xs">
                  <input
                    className={get_input_class_name("compact")}
                    value={rename_values[tag.name] ?? ""}
                    placeholder="Rename to…"
                    aria-label={`Rename ${format_display_tag(tag.name)}`}
                    disabled={is_pending}
                    onChange={(event) =>
                      setRename_values((previous) => ({
                        ...previous,
                        [tag.name]: event.target.value,
                      }))
                    }
                  />
                  <button
                    type="submit"
                    className={`${get_button_class_name("ghost", "small")} shrink-0`}
                    disabled={
                      is_pending ||
                      (rename_values[tag.name]?.trim().length ?? 0) === 0
                    }
                  >
                    Rename
                  </button>
                </div>
              </form>
            </li>
          ))}
        </ul>
      )}

      {status_message === null ? null : (
        <p className="m-0 text-[0.9rem] text-accent">{status_message}</p>
      )}
      {error === null ? null : (
        <p className="m-0 text-[0.9rem] text-danger">{error}</p>
      )}
    </SettingsPageLayout>
  );
}
