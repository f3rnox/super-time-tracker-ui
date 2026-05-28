import { TodayFocusView } from "@/components/today-focus-view";
import { get_today_focus_page_data } from "@/lib/get_today_focus_page_data";

/**
 * Today / focus route — running timers and today's entries.
 */
export default async function TodayPage() {
  const initial_data = await get_today_focus_page_data();

  return <TodayFocusView initial_data={initial_data} />;
}
