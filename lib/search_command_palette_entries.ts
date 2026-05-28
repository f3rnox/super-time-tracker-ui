import { is_entry_archived } from "@/lib/is_entry_archived";
import { is_sheet_archived } from "@/lib/is_sheet_archived";
import { match_entry_search_query } from "@/lib/match_entry_search_query";
import { serialize_entry } from "@/lib/serialize_entry";
import { type CommandPaletteEntrySnapshot } from "@/lib/types/command_palette";
import { type TimeTrackerDB } from "@/lib/types";

const default_limit = 20;

/**
 * Searches completed entries for command palette display.
 */
export function search_command_palette_entries(
  db: TimeTrackerDB,
  query: string,
  limit: number = default_limit,
): CommandPaletteEntrySnapshot[] {
  const normalized_query = query.trim().toLowerCase();

  if (normalized_query.length === 0) {
    return [];
  }

  const matches: CommandPaletteEntrySnapshot[] = [];

  for (const sheet of db.sheets) {
    if (is_sheet_archived(sheet)) {
      continue;
    }

    for (const entry of sheet.entries) {
      if (entry.end === null || is_entry_archived(entry)) {
        continue;
      }

      const query_match = match_entry_search_query(
        {
          sheetName: sheet.name,
          description: entry.description,
          tags: entry.tags,
          noteTexts: entry.notes.map((note) => note.text),
        },
        normalized_query,
      );

      if (!query_match.matches) {
        continue;
      }

      const serialized = serialize_entry(
        entry,
        sheet.name,
        sheet.activeEntryID === entry.id && entry.end === null,
      );

      matches.push({
        id: serialized.id,
        sheetName: serialized.sheetName,
        description: serialized.description,
        tags: serialized.tags,
        end: serialized.end!,
      });

      if (matches.length >= limit) {
        return matches;
      }
    }
  }

  return matches;
}
