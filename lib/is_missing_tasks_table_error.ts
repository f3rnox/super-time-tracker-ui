/**
 * Returns whether a Supabase error likely means the task table migration is missing.
 */
export function is_missing_tasks_table_error(message: string): boolean {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("sheet_tasks") &&
    (normalized.includes("does not exist") ||
      normalized.includes("could not find") ||
      normalized.includes("schema cache"))
  );
}
