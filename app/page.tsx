import { TrackerApp } from "@/components/tracker-app";
import { get_preferred_sheet_from_cookies } from "@/lib/get_preferred_sheet_from_cookies";
import { get_tracker_state } from "@/lib/get_tracker_state";
import { read_db } from "@/lib/read_db";

export default async function Home() {
  const db = await read_db();
  const preferred_sheet = await get_preferred_sheet_from_cookies(db);
  const initial_state = await get_tracker_state(preferred_sheet, {
    db,
    persist_active_sheet: false,
    include_sheet_entries: false,
    include_focus_nudges: true,
  });

  return <TrackerApp initial_state={initial_state} />;
}
