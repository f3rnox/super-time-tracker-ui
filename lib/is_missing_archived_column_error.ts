/**
 * Detects PostgREST errors when archive columns are not migrated yet.
 */
export function is_missing_archived_column_error(message: string): boolean {
  return message.includes("archived") && message.includes("does not exist");
}
