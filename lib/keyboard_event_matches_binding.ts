import { type KeyboardShortcutBinding } from "@/lib/types/keyboard_shortcut";

/**
 * Returns whether a keyboard event matches a shortcut binding.
 */
export function keyboard_event_matches_binding(
  event: KeyboardEvent,
  binding: KeyboardShortcutBinding,
): boolean {
  const modifiers = binding.modifiers ?? [];
  const needs_alt = modifiers.includes("alt");
  const needs_ctrl = modifiers.includes("ctrl");
  const needs_meta = modifiers.includes("meta");
  const needs_shift = modifiers.includes("shift");

  if (event.altKey !== needs_alt) {
    return false;
  }

  if (event.ctrlKey !== needs_ctrl) {
    return false;
  }

  if (event.metaKey !== needs_meta) {
    return false;
  }

  if (event.shiftKey !== needs_shift) {
    return false;
  }

  const event_key =
    event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const binding_key =
    binding.key.length === 1 ? binding.key.toLowerCase() : binding.key;

  return event_key === binding_key;
}
