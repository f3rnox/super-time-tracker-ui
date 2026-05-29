import { type TimeSheetTask } from "@/lib/types";
import { type SerializedTask } from "@/lib/types/task";

/**
 * Converts an in-memory task into a JSON-safe task payload.
 */
export function serialize_task(
  task: TimeSheetTask,
  sheet_name: string,
): SerializedTask {
  return {
    id: task.id,
    sheetName: sheet_name,
    title: task.title,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    completedAt:
      task.completedAt === null ? null : task.completedAt.toISOString(),
  };
}
