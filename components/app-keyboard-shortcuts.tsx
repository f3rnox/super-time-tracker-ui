"use client";

import { usePathname } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";

import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog";
import { get_tracker_keyboard_shortcut_sections } from "@/lib/get_tracker_keyboard_shortcut_sections";
import { parse_tracker_shortcut_map } from "@/lib/parse_tracker_shortcut_map";
import { tracker_shortcut_map_preference } from "@/lib/preferences/tracker_shortcut_map_preference";
import { use_document_keyboard_shortcuts } from "@/lib/use_document_keyboard_shortcuts";
import { type KeyboardShortcutBinding } from "@/lib/types/keyboard_shortcut";

/**
 * Registers app-wide keyboard shortcuts on non-tracker pages.
 */
export function AppKeyboardShortcuts() {
  const pathname = usePathname();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const is_tracker_page = pathname === "/";
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

  const bindings = useMemo((): KeyboardShortcutBinding[] => {
    if (is_tracker_page) {
      return [];
    }

    const help_modifiers: "shift"[] | [] = help_key === "?" ? ["shift"] : [];

    return [
      {
        id: "help",
        label: help_key === "?" ? "?" : help_key.toUpperCase(),
        description: "Show keyboard shortcuts",
        key: help_key,
        modifiers: help_modifiers,
        action: () => {
          setIsHelpOpen((open) => !open);
        },
      },
    ];
  }, [help_key, is_tracker_page]);

  use_document_keyboard_shortcuts(bindings);

  if (isHelpOpen && !is_tracker_page) {
    return (
      <KeyboardShortcutsDialog
        sections={get_tracker_keyboard_shortcut_sections(shortcut_map)}
        on_close={() => setIsHelpOpen(false)}
      />
    );
  }

  return null;
}
