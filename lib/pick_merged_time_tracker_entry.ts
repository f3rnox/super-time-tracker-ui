import { type TimeSheetEntry, type TimeSheetEntryNote } from "@/lib/types";

export type MergePreference = "base" | "incoming";

/**
 * Merges two notes arrays, deduplicating by timestamp and text.
 */
function merge_entry_notes(
  base_notes: TimeSheetEntryNote[],
  incoming_notes: TimeSheetEntryNote[],
): TimeSheetEntryNote[] {
  const seen = new Set<string>();
  const merged: TimeSheetEntryNote[] = [];

  for (const note of [...base_notes, ...incoming_notes]) {
    const key = `${note.timestamp.getTime()}:${note.text}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(note);
  }

  merged.sort(
    (left, right) => left.timestamp.getTime() - right.timestamp.getTime(),
  );

  return merged;
}

/**
 * Chooses the authoritative entry when the same id exists in two databases.
 */
export function pick_merged_time_tracker_entry(
  base: TimeSheetEntry,
  incoming: TimeSheetEntry,
  prefer: MergePreference,
): TimeSheetEntry {
  const base_running = base.end === null;
  const incoming_running = incoming.end === null;

  if (base_running && !incoming_running) {
    const winner = prefer === "base" ? base : incoming;
    const loser = winner === base ? incoming : base;

    return { ...winner, notes: merge_entry_notes(winner.notes, loser.notes) };
  }

  if (incoming_running && !base_running) {
    const winner = prefer === "base" ? base : incoming;
    const loser = winner === base ? incoming : base;

    return { ...winner, notes: merge_entry_notes(winner.notes, loser.notes) };
  }

  if (base_running && incoming_running) {
    const incoming_is_later =
      incoming.start.getTime() > base.start.getTime() ||
      (incoming.start.getTime() === base.start.getTime() &&
        prefer === "incoming");
    const winner = incoming_is_later ? incoming : base;
    const loser = incoming_is_later ? base : incoming;

    return { ...winner, notes: merge_entry_notes(winner.notes, loser.notes) };
  }

  const base_end = base.end?.getTime() ?? 0;
  const incoming_end = incoming.end?.getTime() ?? 0;

  if (base_end !== incoming_end) {
    const winner = base_end > incoming_end ? base : incoming;
    const loser = winner === base ? incoming : base;

    return { ...winner, notes: merge_entry_notes(winner.notes, loser.notes) };
  }

  const winner = prefer === "incoming" ? incoming : base;
  const loser = winner === base ? incoming : base;

  return { ...winner, notes: merge_entry_notes(winner.notes, loser.notes) };
}
