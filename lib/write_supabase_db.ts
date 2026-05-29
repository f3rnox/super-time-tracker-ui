import { create_server_supabase_client } from "@/lib/create_server_supabase_client";
import { get_supabase_persisted_db_version } from "@/lib/get_supabase_persisted_db_version";
import { is_missing_archived_column_error } from "@/lib/is_missing_archived_column_error";
import { is_missing_tasks_table_error } from "@/lib/is_missing_tasks_table_error";
import { sync_supabase_sheet_entries } from "@/lib/sync_supabase_sheet_entries";
import { sync_supabase_sheet_tasks } from "@/lib/sync_supabase_sheet_tasks";
import { supports_supabase_archive_columns } from "@/lib/supports_supabase_archive_columns";
import { supports_supabase_tasks } from "@/lib/supports_supabase_tasks";
import { type TimeTrackerDB } from "@/lib/types";

interface SheetUpsertRow {
  user_id: string;
  name: string;
  active_entry_id: number | null;
  archived?: boolean;
}

interface ExistingSheetRow {
  id: string;
  name: string;
}

/**
 * Persists the in-memory database to Supabase for the signed-in user.
 */
export async function write_supabase_db(
  db: TimeTrackerDB,
  user_id: string,
): Promise<void> {
  const supabase = await create_server_supabase_client();

  const { data: account_row, error: account_read_error } = await supabase
    .from("tracker_accounts")
    .select("db_version")
    .eq("user_id", user_id)
    .maybeSingle();

  if (account_read_error !== null) {
    throw new Error(
      `Failed to load tracker account: ${account_read_error.message}`,
    );
  }

  const cloud_db_version = (account_row as { db_version?: number } | null)
    ?.db_version;
  let include_archived = supports_supabase_archive_columns(cloud_db_version);
  let include_tasks = supports_supabase_tasks(cloud_db_version);
  let persisted_db_version = get_supabase_persisted_db_version(
    db.version,
    cloud_db_version,
  );

  const { error: account_error } = await supabase
    .from("tracker_accounts")
    .upsert(
      {
        user_id,
        active_sheet_name: db.activeSheetName,
        db_version: persisted_db_version,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

  if (account_error !== null) {
    throw new Error(`Failed to save tracker account: ${account_error.message}`);
  }

  const { data: existing_sheet_rows, error: list_error } = await supabase
    .from("sheets")
    .select("id, name")
    .eq("user_id", user_id);

  if (list_error !== null) {
    throw new Error(`Failed to list sheets: ${list_error.message}`);
  }

  const existing_sheets = (existing_sheet_rows ?? []) as ExistingSheetRow[];
  const desired_sheet_names = new Set(db.sheets.map((sheet) => sheet.name));
  const sheet_ids_to_delete = existing_sheets
    .filter((sheet) => !desired_sheet_names.has(sheet.name))
    .map((sheet) => sheet.id);

  if (sheet_ids_to_delete.length > 0) {
    const { error: delete_error } = await supabase
      .from("sheets")
      .delete()
      .in("id", sheet_ids_to_delete);

    if (delete_error !== null) {
      throw new Error(
        `Failed to remove deleted sheets: ${delete_error.message}`,
      );
    }
  }

  for (const sheet of db.sheets) {
    const sheet_row: SheetUpsertRow = {
      user_id,
      name: sheet.name,
      active_entry_id: sheet.activeEntryID,
      ...(include_archived && sheet.archived === true
        ? { archived: true }
        : {}),
    };

    const { data: upserted_sheet, error: sheet_error } = await supabase
      .from("sheets")
      .upsert(sheet_row, { onConflict: "user_id,name" })
      .select("id")
      .single();

    if (
      sheet_error !== null &&
      include_archived &&
      is_missing_archived_column_error(sheet_error.message)
    ) {
      include_archived = false;
      persisted_db_version = get_supabase_persisted_db_version(db.version, 3);

      await supabase
        .from("tracker_accounts")
        .update({ db_version: 3 })
        .eq("user_id", user_id);

      const retry_row: SheetUpsertRow = {
        user_id,
        name: sheet.name,
        active_entry_id: sheet.activeEntryID,
      };

      const retry = await supabase
        .from("sheets")
        .upsert(retry_row, { onConflict: "user_id,name" })
        .select("id")
        .single();

      if (retry.error !== null) {
        throw new Error(
          `Failed to save sheet "${sheet.name}": ${retry.error.message}`,
        );
      }

      const sheet_id = (retry.data as { id: string }).id;

      await sync_supabase_sheet_entries(
        supabase,
        sheet_id,
        sheet,
        include_archived,
      );
      if (include_tasks) {
        try {
          await sync_supabase_sheet_tasks(supabase, sheet_id, sheet);
        } catch (tasks_error: unknown) {
          if (
            tasks_error instanceof Error &&
            is_missing_tasks_table_error(tasks_error.message)
          ) {
            include_tasks = false;
            persisted_db_version = get_supabase_persisted_db_version(
              db.version,
              4,
            );
            await supabase
              .from("tracker_accounts")
              .update({ db_version: persisted_db_version })
              .eq("user_id", user_id);
          } else {
            throw tasks_error;
          }
        }
      }
      continue;
    }

    if (sheet_error !== null) {
      throw new Error(
        `Failed to save sheet "${sheet.name}": ${sheet_error.message}`,
      );
    }

    const sheet_id = (upserted_sheet as { id: string }).id;

    await sync_supabase_sheet_entries(
      supabase,
      sheet_id,
      sheet,
      include_archived,
    );

    if (!include_tasks) {
      continue;
    }

    try {
      await sync_supabase_sheet_tasks(supabase, sheet_id, sheet);
    } catch (tasks_error: unknown) {
      if (
        tasks_error instanceof Error &&
        is_missing_tasks_table_error(tasks_error.message)
      ) {
        include_tasks = false;
        persisted_db_version = get_supabase_persisted_db_version(db.version, 4);
        await supabase
          .from("tracker_accounts")
          .update({ db_version: persisted_db_version })
          .eq("user_id", user_id);
        continue;
      }

      throw tasks_error;
    }
  }
}
