import { PomodoroView } from "@/components/pomodoro-view";
import { collect_known_tags } from "@/lib/collect_known_tags";
import { read_db } from "@/lib/read_db";

/**
 * Pomodoro route with a configurable focus timer.
 */
export default async function PomodoroPage() {
  const db = await read_db();
  const known_tags = collect_known_tags(db);

  return <PomodoroView known_tags={known_tags} />;
}
