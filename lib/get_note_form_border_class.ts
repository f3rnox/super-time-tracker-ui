/**
 * Returns optional top-border classes for the note form container.
 */
export function get_note_form_border_class(
  in_active_panel: boolean,
  in_bar: boolean,
): string {
  if (in_active_panel && !in_bar) {
    return "border-t border-accent-border pt-4";
  }

  if (in_bar) {
    return "border-t border-[color-mix(in_srgb,var(--accent-border)_65%,var(--panel-border))] pt-3.5";
  }

  return "";
}
