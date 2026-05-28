import { type KeyboardShortcutModifier } from "@/lib/types/keyboard_shortcut";

const modifier_labels: Record<KeyboardShortcutModifier, string> = {
  alt: "Alt",
  ctrl: "Ctrl",
  meta: "Meta",
  shift: "Shift",
};

/**
 * Formats a shortcut key and modifiers for display.
 */
export function format_keyboard_shortcut_label(
  key: string,
  modifiers: KeyboardShortcutModifier[] = [],
): string {
  const parts = modifiers.map((modifier) => modifier_labels[modifier]);

  parts.push(key.length === 1 ? key.toUpperCase() : key);

  return parts.join("+");
}
