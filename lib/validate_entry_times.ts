/**
 * Ensures a completed entry has a start time strictly before its end time.
 */
export function validate_entry_times(start: Date, end: Date | null): void {
  if (end === null) {
    return;
  }

  if (+start >= +end) {
    throw new Error("Start must be before end");
  }
}
