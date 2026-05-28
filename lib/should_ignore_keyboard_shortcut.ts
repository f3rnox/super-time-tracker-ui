/**
 * Returns whether global shortcuts should be skipped for the current event target.
 */
export function should_ignore_keyboard_shortcut(event: KeyboardEvent): boolean {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const tag = target.tagName;

  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}
