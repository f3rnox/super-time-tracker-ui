"use client";

import { useRouter } from "next/navigation";
import { type RefObject, useMemo, useState, useSyncExternalStore } from "react";

import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog";
import { type ActiveEntryPanelHandle } from "@/components/active-entry-panel";
import { type CheckInFormCollapsibleHandle } from "@/components/check-in-form-collapsible";
import { get_adjacent_sheet_name } from "@/lib/get_adjacent_sheet_name";
import { type CheckOutOptions } from "@/lib/types/check_out_options";
import { get_tracker_keyboard_shortcut_sections } from "@/lib/get_tracker_keyboard_shortcut_sections";
import { parse_tracker_shortcut_map } from "@/lib/parse_tracker_shortcut_map";
import { tracker_shortcut_map_preference } from "@/lib/preferences/tracker_shortcut_map_preference";
import { useCheckOutAction } from "@/lib/use_check_out_action";
import { use_document_keyboard_shortcuts } from "@/lib/use_document_keyboard_shortcuts";
import { type KeyboardShortcutBinding } from "@/lib/types/keyboard_shortcut";
import {
  type SerializedEntry,
  type SerializedSheet,
} from "@/lib/types/tracker_state";

interface TrackerKeyboardShortcutsProps {
  sheets: SerializedSheet[];
  active_sheet_name: string;
  active_entry: SerializedEntry | null;
  is_pending: boolean;
  check_in_form_ref: RefObject<CheckInFormCollapsibleHandle | null>;
  active_entry_panel_ref: RefObject<ActiveEntryPanelHandle | null>;
  on_select_sheet: (name: string) => void;
  on_check_out: (options?: CheckOutOptions) => void;
}

/**
 * Registers tracker page keyboard shortcuts and the shortcuts help dialog.
 */
export function TrackerKeyboardShortcuts({
  sheets,
  active_sheet_name,
  active_entry,
  is_pending,
  check_in_form_ref,
  active_entry_panel_ref,
  on_select_sheet,
  on_check_out,
}: Readonly<TrackerKeyboardShortcutsProps>) {
  const router = useRouter();
  const [is_help_open, setIs_help_open] = useState(false);
  const check_out = useCheckOutAction(on_check_out);
  const shortcut_map_json = useSyncExternalStore(
    tracker_shortcut_map_preference.subscribe,
    tracker_shortcut_map_preference.get_snapshot,
    tracker_shortcut_map_preference.get_server_snapshot,
  );
  const shortcut_map = useMemo(
    () => parse_tracker_shortcut_map(shortcut_map_json),
    [shortcut_map_json],
  );
  const help_key = shortcut_map.help;
  const help_label = help_key === "?" ? "?" : help_key.toUpperCase();

  const bindings = useMemo((): KeyboardShortcutBinding[] => {
    const is_tracking = active_entry !== null;
    const help_modifiers: "shift"[] | [] = help_key === "?" ? ["shift"] : [];

    return [
      {
        id: "help",
        label: help_label,
        description: "Show keyboard shortcuts",
        key: help_key,
        modifiers: help_modifiers,
        action: () => {
          setIs_help_open((open) => !open);
        },
      },
      {
        id: "check-in",
        label: shortcut_map["check-in"].toUpperCase(),
        description: "Check in (focus description)",
        key: shortcut_map["check-in"],
        is_available: () => !is_pending && !is_tracking,
        action: () => {
          check_in_form_ref.current?.expand_and_focus();
        },
      },
      {
        id: "check-out",
        label: shortcut_map["check-out"].toUpperCase(),
        description: "Check out",
        key: shortcut_map["check-out"],
        is_available: () => !is_pending && is_tracking,
        action: () => {
          check_out().catch(() => {});
        },
      },
      {
        id: "edit-entry",
        label: shortcut_map["edit-entry"].toUpperCase(),
        description: "Edit active entry",
        key: shortcut_map["edit-entry"],
        is_available: () => !is_pending && is_tracking,
        action: () => {
          active_entry_panel_ref.current?.start_edit();
        },
      },
      {
        id: "add-note",
        label: shortcut_map["add-note"].toUpperCase(),
        description: "Add note to active entry",
        key: shortcut_map["add-note"],
        is_available: () => !is_pending && is_tracking,
        action: () => {
          active_entry_panel_ref.current?.start_add_note();
        },
      },
      {
        id: "pomodoro",
        label: shortcut_map.pomodoro.toUpperCase(),
        description: "Open Pomodoro",
        key: shortcut_map.pomodoro,
        is_available: () => !is_pending,
        action: () => {
          router.push("/pomodoro");
        },
      },
      {
        id: "previous-sheet",
        label: shortcut_map["previous-sheet"],
        description: "Previous sheet",
        key: shortcut_map["previous-sheet"],
        is_available: () => !is_pending && sheets.length > 1,
        action: () => {
          const sheet_name = get_adjacent_sheet_name(
            sheets,
            active_sheet_name,
            "previous",
          );

          if (sheet_name !== null && sheet_name !== active_sheet_name) {
            on_select_sheet(sheet_name);
          }
        },
      },
      {
        id: "next-sheet",
        label: shortcut_map["next-sheet"],
        description: "Next sheet",
        key: shortcut_map["next-sheet"],
        is_available: () => !is_pending && sheets.length > 1,
        action: () => {
          const sheet_name = get_adjacent_sheet_name(
            sheets,
            active_sheet_name,
            "next",
          );

          if (sheet_name !== null && sheet_name !== active_sheet_name) {
            on_select_sheet(sheet_name);
          }
        },
      },
    ];
  }, [
    active_entry,
    active_entry_panel_ref,
    active_sheet_name,
    check_in_form_ref,
    check_out,
    is_pending,
    on_select_sheet,
    router,
    help_key,
    help_label,
    shortcut_map,
    sheets,
  ]);

  use_document_keyboard_shortcuts(bindings);

  if (!is_help_open) {
    return null;
  }

  return (
    <KeyboardShortcutsDialog
      sections={get_tracker_keyboard_shortcut_sections(shortcut_map)}
      on_close={() => setIs_help_open(false)}
    />
  );
}
