import { get_app_keyboard_shortcut_sections } from "@/lib/get_app_keyboard_shortcut_sections";
import {
  tracker_shortcut_defaults,
  type TrackerShortcutMap,
} from "@/lib/types/quick_actions";
import { type KeyboardShortcutSection } from "@/lib/types/keyboard_shortcut";

/**
 * Returns help sections for the tracker home page.
 */
export function get_tracker_keyboard_shortcut_sections(
  shortcut_map: TrackerShortcutMap = tracker_shortcut_defaults,
): KeyboardShortcutSection[] {
  return [
    ...get_app_keyboard_shortcut_sections(
      shortcut_map.help === "?" ? "?" : shortcut_map.help.toUpperCase(),
    ),
    {
      title: "Tracker",
      entries: [
        {
          label: shortcut_map["check-in"].toUpperCase(),
          description: "Check in (focus description)",
        },
        {
          label: shortcut_map["check-out"].toUpperCase(),
          description: "Check out",
        },
        {
          label: shortcut_map["edit-entry"].toUpperCase(),
          description: "Edit active entry description",
        },
        {
          label: shortcut_map["add-note"].toUpperCase(),
          description: "Add note to active entry",
        },
        {
          label: shortcut_map.pomodoro.toUpperCase(),
          description: "Open Pomodoro",
        },
        {
          label: shortcut_map["previous-sheet"],
          description: "Previous sheet",
        },
        {
          label: shortcut_map["next-sheet"],
          description: "Next sheet",
        },
        {
          label: shortcut_map["zen-mode"].toUpperCase(),
          description: "Toggle Zen Mode focus engine",
        },
      ],
    },
  ];
}
