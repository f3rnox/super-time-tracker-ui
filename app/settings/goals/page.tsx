import { GoalSettingsView } from "@/components/goal-settings-view";
import { collect_known_tags } from "@/lib/collect_known_tags";
import { read_db } from "@/lib/read_db";

/**
 * Goal settings route.
 */
export default async function GoalSettingsPage() {
  const db = await read_db();
  const sheet_names = db.sheets.map((sheet) => sheet.name);
  const tag_names = collect_known_tags(db);

  return <GoalSettingsView sheet_names={sheet_names} tag_names={tag_names} />;
}
