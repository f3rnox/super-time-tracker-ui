/**
 * Builds the root section class list for an entry notes list.
 */
export function get_entry_notes_root_class(
  is_inline: boolean,
  in_bar: boolean,
  is_panel_in_bar: boolean,
  is_list_visible: boolean,
): string {
  const classes = [
    is_inline ? "m-0 w-full p-0" : "border-t border-accent-border pt-3.5",
  ];

  if (in_bar && !is_inline) {
    classes.push(
      "border-[color-mix(in_srgb,var(--accent-border)_65%,var(--panel-border))]",
    );
  }

  if (is_panel_in_bar && is_list_visible) {
    classes.push("flex min-h-0 flex-1 flex-col");
  } else if (is_panel_in_bar) {
    classes.push("flex shrink-0 flex-col");
  }

  return classes.join(" ");
}
