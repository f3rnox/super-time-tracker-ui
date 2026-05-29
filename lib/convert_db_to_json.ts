import {
  type JSONTimeTrackerDB,
  type JSONTimeSheet,
  type JSONTimeSheetEntry,
  type JSONTimeSheetTask,
  type TimeTrackerDB,
} from "@/lib/types";

/**
 * Converts an in-memory database into JSON-serializable timestamps.
 */
export function convert_db_to_json(db: TimeTrackerDB): JSONTimeTrackerDB {
  const sheets: JSONTimeSheet[] = db.sheets.map((sheet) => ({
    name: sheet.name,
    activeEntryID: sheet.activeEntryID,
    ...(sheet.archived === true ? { archived: true } : {}),
    tasks: sheet.tasks.map(
      (task): JSONTimeSheetTask => ({
        id: task.id,
        title: task.title,
        createdAt: task.createdAt.getTime(),
        updatedAt: task.updatedAt.getTime(),
        completedAt:
          task.completedAt === null ? null : task.completedAt.getTime(),
      }),
    ),
    entries: sheet.entries.map(
      (entry): JSONTimeSheetEntry => ({
        id: entry.id,
        description: entry.description,
        tags: entry.tags,
        start: entry.start.getTime(),
        end: entry.end === null ? null : entry.end.getTime(),
        notes: entry.notes.map((note) => ({
          text: note.text,
          timestamp: note.timestamp.getTime(),
        })),
        ...(entry.archived === true ? { archived: true } : {}),
      }),
    ),
  }));

  return {
    version: db.version,
    activeSheetName: db.activeSheetName,
    sheets,
  };
}
