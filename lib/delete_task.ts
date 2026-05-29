import { get_sheet } from "@/lib/get_sheet";
import { find_sheet_task } from "@/lib/find_sheet_task";
import { read_db } from "@/lib/read_db";
import { write_db } from "@/lib/write_db";

export interface DeleteTaskArgs {
  sheet_name: string;
  task_id: string;
}

/**
 * Removes a task from a sheet.
 */
export async function delete_task(args: DeleteTaskArgs): Promise<void> {
  const db = await read_db();
  const sheet = get_sheet(db, args.sheet_name);

  find_sheet_task(db, args.sheet_name, args.task_id);

  sheet.tasks = sheet.tasks.filter((task) => task.id !== args.task_id);

  await write_db(db);
}
