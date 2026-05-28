"use client";

import { useEffect, useSyncExternalStore } from "react";

import { format_display_tag } from "@/lib/format_display_tag";
import { get_button_class_name } from "@/lib/get_button_class_name";
import {
  get_sheet_tag_filter_server_snapshot,
  get_sheet_tag_filter_snapshot,
} from "@/lib/get_sheet_tag_filter_snapshot";
import { prune_sheet_tag_filter } from "@/lib/prune_sheet_tag_filter";
import { set_sheet_tag_filter } from "@/lib/set_sheet_tag_filter";
import { subscribe_sheet_tag_filters } from "@/lib/subscribe_sheet_tag_filters";
import { tags_are_equal } from "@/lib/tags_are_equal";
import { toggle_sheet_tag_filter } from "@/lib/toggle_sheet_tag_filter";
import { use_tag_filter_mode } from "@/lib/use_tag_filter_mode";
import { type TagStat } from "@/lib/types/tag_management";

type EntryTagFilterProps = Readonly<{
  sheet_name: string;
  sheet_tags: TagStat[];
}>;

/**
 * Toggle filters for showing only entries that match selected tags.
 */
export function EntryTagFilter({
  sheet_name,
  sheet_tags,
}: EntryTagFilterProps) {
  const tag_filter_mode = use_tag_filter_mode();
  const filter_tags = useSyncExternalStore(
    subscribe_sheet_tag_filters,
    () => get_sheet_tag_filter_snapshot(sheet_name),
    get_sheet_tag_filter_server_snapshot,
  );

  useEffect(() => {
    prune_sheet_tag_filter(
      sheet_name,
      sheet_tags.map((tag) => tag.name),
    );
  }, [sheet_name, sheet_tags]);

  if (sheet_tags.length === 0) {
    return null;
  }

  const has_filter = filter_tags.length > 0;

  return (
    <fieldset className="m-0 flex flex-wrap items-center gap-x-3 gap-y-2 border-0 p-0">
      <legend className="sr-only">Filter by tag</legend>
      <h2 className="m-0 shrink-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em]">
        Filter by tag
      </h2>
      <p className="m-0 shrink-0 text-[0.8rem] text-muted">
        {tag_filter_mode === "any"
          ? "Show entries that include any selected tag."
          : "Show entries that include every selected tag."}
      </p>
      <div className="ml-auto flex min-w-0 flex-wrap justify-end gap-1">
        {sheet_tags.map((tag) => {
          const is_selected = filter_tags.some((filter_tag) =>
            tags_are_equal(filter_tag, tag.name),
          );

          return (
            <button
              key={tag.name}
              type="button"
              className={`${get_button_class_name("ghost", "small")} ${
                is_selected
                  ? "border-accent-border bg-accent-soft text-foreground"
                  : ""
              }`}
              aria-pressed={is_selected}
              onClick={() => toggle_sheet_tag_filter(sheet_name, tag.name)}
            >
              {format_display_tag(tag.name)}
              <span className="ml-1 font-normal text-muted">
                ({tag.entryCount})
              </span>
            </button>
          );
        })}
        {has_filter ? (
          <button
            type="button"
            className={get_button_class_name("ghost", "small")}
            onClick={() => set_sheet_tag_filter(sheet_name, [])}
          >
            Clear filter
          </button>
        ) : null}
      </div>
    </fieldset>
  );
}
