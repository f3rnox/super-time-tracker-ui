import { get_sheet } from "@/lib/get_sheet";
import { find_sheet_task } from "@/lib/find_sheet_task";
import { read_db } from "@/lib/read_db";
import { write_db } from "@/lib/write_db";

export interface UpdateTaskArgs {
  sheet_name: string;
  task_id: string;
  title?: string;
  completed?: boolean;
  target_sheet_name?: string;
}

/**
 * Updates task text, completion, or sheet assignment.
 */
export async function update_task(args: UpdateTaskArgs): Promise<void> {
  const db = await read_db();
  const source_sheet = get_sheet(db, args.sheet_name);
  const task = find_sheet_task(db, args.sheet_name, args.task_id);
  const now = new Date();

  if (args.title !== undefined) {
    const title = args.title.trim();

    if (title.length === 0) {
      throw new Error("Task title is required");
    }

    task.title = title;
    task.updatedAt = now;
  }

  if (args.completed !== undefined) {
    task.completedAt = args.completed ? (task.completedAt ?? now) : null;
    task.updatedAt = now;
  }

  if (
    args.target_sheet_name !== undefined &&
    args.target_sheet_name !== args.sheet_name
  ) {
    const target_sheet = get_sheet(db, args.target_sheet_name);
    source_sheet.tasks = source_sheet.tasks.filter(
      (candidate) => candidate.id !== args.task_id,
    );
    target_sheet.tasks.unshift(task);
    task.updatedAt = now;
  }

  await write_db(db);
}
