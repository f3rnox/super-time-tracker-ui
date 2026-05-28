/** Cloud schema version that introduced sheets.entries archived columns. */
export const SUPABASE_ARCHIVE_SCHEMA_DB_VERSION = 4;

/**
 * Whether the linked Supabase project has archive columns (db_version 4+).
 */
export function supports_supabase_archive_columns(
  db_version: number | undefined,
): boolean {
  return (db_version ?? 1) >= SUPABASE_ARCHIVE_SCHEMA_DB_VERSION;
}
