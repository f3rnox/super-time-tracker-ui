import { type SerializedTask } from "@/lib/types/task";

/**
 * Sorts open tasks before completed tasks, newest first within each group.
 */
export function sort_serialized_tasks(
  tasks: SerializedTask[],
): SerializedTask[] {
  return [...tasks].sort((left, right) => {
    if (left.completedAt === null && right.completedAt !== null) {
      return -1;
    }

    if (left.completedAt !== null && right.completedAt === null) {
      return 1;
    }

    return (
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
  });
}
