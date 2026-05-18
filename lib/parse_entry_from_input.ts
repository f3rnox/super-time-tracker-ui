import { type TimeSheetEntry } from "@/lib/types";

/**
 * Parses a check-in description, extracting @tags from the text.
 */
export function parse_entry_from_input(
  id: number,
  input: string,
  start?: Date,
  end?: Date | null,
): TimeSheetEntry {
  const tags = input.match(/@\w+/g) ?? [];
  const description = input.split(/@\w+/).join(" ").trim();

  return {
    id,
    tags,
    notes: [],
    description,
    start: start ?? new Date(),
    end: end ?? null,
  };
}
