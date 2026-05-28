/** Modifier keys required for a shortcut binding. */
export type KeyboardShortcutModifier = "alt" | "ctrl" | "meta" | "shift";

/**
 * A document-level keyboard shortcut with optional availability guard.
 */
export interface KeyboardShortcutBinding {
  id: string;
  label: string;
  description: string;
  key: string;
  modifiers?: KeyboardShortcutModifier[];
  is_available?: () => boolean;
  action: () => void;
}

/** Group of shortcuts shown in the help dialog. */
export interface KeyboardShortcutSection {
  title: string;
  entries: Pick<KeyboardShortcutBinding, "label" | "description">[];
}
