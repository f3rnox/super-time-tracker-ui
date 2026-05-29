import { get_sheet } from "@/lib/get_sheet";
import { type TimeSheetTask, type TimeTrackerDB } from "@/lib/types";

/**
 * Finds a sheet task or throws when it does not exist.
 */
export function find_sheet_task(
  db: TimeTrackerDB,
  sheet_name: string,
  task_id: string,
): TimeSheetTask {
  const sheet = get_sheet(db, sheet_name);
  const task = sheet.tasks.find((candidate) => candidate.id === task_id);

  if (task === undefined) {
    throw new Error("Task not found");
  }

  return task;
}
