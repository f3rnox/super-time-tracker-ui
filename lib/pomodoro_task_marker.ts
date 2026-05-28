import { type SerializedEntry } from '@/lib/types/tracker_state'

export const POMODORO_TASK_NOTE_TEXT = 'Pomodoro task'

/**
 * Returns true when an entry was created via the Pomodoro interface.
 */
export function is_pomodoro_task_entry(entry: SerializedEntry): boolean {
  return entry.notes.some((note) => note.text.trim() === POMODORO_TASK_NOTE_TEXT)
}
