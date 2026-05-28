import { GeneralSettingsView } from "@/components/general-settings-view";
import { read_db } from "@/lib/read_db";

/**
 * Settings index route — general tracker behavior.
 */
export default async function SettingsPage() {
  const db = await read_db();
  const sheet_names = db.sheets.map((sheet) => sheet.name);

  return <GeneralSettingsView sheet_names={sheet_names} />;
}
