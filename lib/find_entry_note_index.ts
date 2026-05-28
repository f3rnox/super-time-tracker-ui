import { type TimeSheetEntryNote } from "@/lib/types";

export interface FindEntryNoteIndexArgs {
  notes: TimeSheetEntryNote[];
  note_timestamp: string;
  text?: string;
}

/**
 * Parses a client note timestamp into epoch milliseconds.
 */
function note_timestamp_to_ms(note_timestamp: string): number | null {
  const parsed = new Date(note_timestamp).getTime();

  if (!Number.isNaN(parsed)) {
    return parsed;
  }

  const as_number = Number(note_timestamp);

  if (Number.isFinite(as_number)) {
    return as_number;
  }

  return null;
}

/**
 * Locates a note on an entry by timestamp, optionally disambiguated by text.
 */
export function find_entry_note_index(args: FindEntryNoteIndexArgs): number {
  const { notes, note_timestamp, text } = args;
  const target_ms = note_timestamp_to_ms(note_timestamp);

  if (target_ms === null) {
    return -1;
  }

  const indices_at_timestamp = notes.reduce<number[]>(
    (indices, note, index) => {
      if (note.timestamp.getTime() === target_ms) {
        indices.push(index);
      }

      return indices;
    },
    [],
  );

  if (indices_at_timestamp.length === 0) {
    return -1;
  }

  const trimmed_text = text?.trim();

  if (trimmed_text !== undefined && trimmed_text.length > 0) {
    const text_match = notes.findIndex(
      (note) =>
        note.timestamp.getTime() === target_ms &&
        note.text.trim() === trimmed_text,
    );

    if (text_match !== -1) {
      return text_match;
    }
  }

  if (indices_at_timestamp.length === 1) {
    return indices_at_timestamp[0] ?? -1;
  }

  return -1;
}
