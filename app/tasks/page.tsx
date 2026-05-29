import { TasksView } from "@/components/tasks-view";
import { get_tasks_page_data } from "@/lib/get_tasks_page_data";

/**
 * Tasks route - sheet-scoped task management.
 */
export default async function TasksPage() {
  const initial_data = await get_tasks_page_data();

  return <TasksView initial_data={initial_data} />;
}
