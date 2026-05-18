/**
 * Applies the compact lists setting to the document root element.
 */
export function apply_compact_lists(enabled: boolean): void {
  document.documentElement.setAttribute(
    "data-compact-lists",
    enabled ? "true" : "false",
  );
}
