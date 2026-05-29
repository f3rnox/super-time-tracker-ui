import type { SupabaseClient } from "@supabase/supabase-js";

import { type TimeSheet } from "@/lib/types";

interface TaskInsertRow {
  sheet_id: string;
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

/**
 * Upserts tasks and removes deleted tasks for one sheet in Supabase.
 */
export async function sync_supabase_sheet_tasks(
  supabase: SupabaseClient,
  sheet_id: string,
  sheet: TimeSheet,
): Promise<void> {
  const desired_task_ids = new Set(sheet.tasks.map((task) => task.id));

  const { data: existing_task_rows, error: list_tasks_error } = await supabase
    .from("sheet_tasks")
    .select("id")
    .eq("sheet_id", sheet_id);

  if (list_tasks_error !== null) {
    throw new Error(
      `Failed to list tasks for "${sheet.name}": ${list_tasks_error.message}`,
    );
  }

  const existing_task_ids = (existing_task_rows ?? []).map(
    (row) => (row as { id: string }).id,
  );
  const task_ids_to_delete = existing_task_ids.filter(
    (id) => !desired_task_ids.has(id),
  );

  if (task_ids_to_delete.length > 0) {
    const { error: delete_tasks_error } = await supabase
      .from("sheet_tasks")
      .delete()
      .eq("sheet_id", sheet_id)
      .in("id", task_ids_to_delete);

    if (delete_tasks_error !== null) {
      throw new Error(
        `Failed to remove tasks for "${sheet.name}": ${delete_tasks_error.message}`,
      );
    }
  }

  if (sheet.tasks.length === 0) {
    return;
  }

  const task_rows: TaskInsertRow[] = sheet.tasks.map((task) => ({
    sheet_id,
    id: task.id,
    title: task.title,
    created_at: task.createdAt.toISOString(),
    updated_at: task.updatedAt.toISOString(),
    completed_at:
      task.completedAt === null ? null : task.completedAt.toISOString(),
  }));

  const { error: tasks_error } = await supabase
    .from("sheet_tasks")
    .upsert(task_rows, { onConflict: "sheet_id,id" });

  if (tasks_error !== null) {
    throw new Error(
      `Failed to save tasks for "${sheet.name}": ${tasks_error.message}`,
    );
  }
}
