import Link from "next/link";

import { get_button_class_name } from "@/lib/get_button_class_name";

const pomodoro_quick_action_class_name = `${get_button_class_name(
  "primary",
)} inline-flex min-w-40 flex-col items-center justify-center whitespace-nowrap text-center text-accent-text-on`;

/**
 * Link to the Pomodoro page from the tracker quick-action card.
 */
export function PomodoroQuickActionLink() {
  return (
    <Link
      href="/pomodoro"
      className={pomodoro_quick_action_class_name}
      aria-label="Open Pomodoro timer"
    >
      <span className="text-[0.9rem] leading-none text-accent-text-on">
        Start Pomodoro
      </span>
      <span className="mt-1 text-[0.72rem] font-medium leading-none text-accent-text-on opacity-85">
        Focus timer
      </span>
    </Link>
  );
}
