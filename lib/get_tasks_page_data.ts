import { collect_known_tags } from "@/lib/collect_known_tags";
import { filter_visible_sheets } from "@/lib/filter_visible_sheets";
import { read_db } from "@/lib/read_db";
import { serialize_task } from "@/lib/serialize_task";
import { sort_serialized_tasks } from "@/lib/sort_serialized_tasks";
import { type TasksPageData } from "@/lib/types/task";

/**
 * Loads the sheet task snapshot for the Tasks page.
 */
export async function get_tasks_page_data(): Promise<TasksPageData> {
  const db = await read_db();
  const visible_sheets = filter_visible_sheets(db.sheets);
  const active_sheet_name =
    visible_sheets.find((sheet) => sheet.name === db.activeSheetName)?.name ??
    visible_sheets[0]?.name ??
    null;

  return {
    activeSheetName: active_sheet_name,
    sheets: visible_sheets.map((sheet) => ({
      name: sheet.name,
      taskCount: sheet.tasks.length,
      openTaskCount: sheet.tasks.filter((task) => task.completedAt === null)
        .length,
      isActive: sheet.name === active_sheet_name,
      hasActiveEntry: sheet.activeEntryID !== null,
    })),
    tasks: sort_serialized_tasks(
      visible_sheets.flatMap((sheet) =>
        sheet.tasks.map((task) => serialize_task(task, sheet.name)),
      ),
    ),
    knownTags: collect_known_tags(db),
  };
}
