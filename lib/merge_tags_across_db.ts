import { collect_tag_stats } from "@/lib/collect_tag_stats";
import { normalize_stored_tag } from "@/lib/normalize_stored_tag";
import { read_db } from "@/lib/read_db";
import { tags_are_equal } from "@/lib/tags_are_equal";
import { type TagStat } from "@/lib/types/tag_management";
import { write_db } from "@/lib/write_db";

export interface MergeTagsAcrossDbResult {
  entries_updated: number;
  tags: TagStat[];
}

/**
 * Replaces source tags with a target tag on every entry and deduplicates tag lists.
 */
export async function merge_tags_across_db(
  source_tags: string[],
  target_tag: string,
): Promise<MergeTagsAcrossDbResult> {
  const normalized_target = normalize_stored_tag(target_tag);
  const normalized_sources = [
    ...new Set(
      source_tags
        .map((tag) => normalize_stored_tag(tag))
        .filter((tag) => !tags_are_equal(tag, normalized_target)),
    ),
  ];

  if (normalized_sources.length === 0) {
    throw new Error(
      "Choose at least one source tag different from the target.",
    );
  }

  const db = await read_db();
  let entries_updated = 0;

  for (const sheet of db.sheets) {
    for (const entry of sheet.entries) {
      let changed = false;
      const next_tags: string[] = [];
      const seen = new Set<string>();

      for (const tag of entry.tags) {
        let next_tag: string;

        try {
          next_tag = normalize_stored_tag(tag);
        } catch {
          next_tag = tag;
        }

        if (
          normalized_sources.some((source_tag) =>
            tags_are_equal(source_tag, next_tag),
          )
        ) {
          next_tag = normalized_target;
          changed = true;
        }

        if (!seen.has(next_tag)) {
          seen.add(next_tag);
          next_tags.push(next_tag);
        }
      }

      if (changed) {
        entry.tags = next_tags;
        entries_updated += 1;
      }
    }
  }

  if (entries_updated > 0) {
    await write_db(db);
  }

  return {
    entries_updated,
    tags: collect_tag_stats(db),
  };
}
