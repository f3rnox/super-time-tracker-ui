export const SUPABASE_TASKS_SCHEMA_DB_VERSION = 5;

/**
 * Whether the linked Supabase project has sheet task storage (db_version 5+).
 */
export function supports_supabase_tasks(
  db_version: number | undefined,
): boolean {
  return (db_version ?? 1) >= SUPABASE_TASKS_SCHEMA_DB_VERSION;
}
