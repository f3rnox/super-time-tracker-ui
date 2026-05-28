/**
 * Builds the list item class for a single entry note row.
 */
export function get_entry_notes_item_class(
  is_inline: boolean,
  is_panel_in_bar: boolean,
): string {
  if (is_inline) {
    return "flex flex-col gap-0.5 rounded-sm border border-panel-border bg-ghost-bg px-2 py-1.5 compact:rounded-none compact:px-1.5 compact:py-1";
  }

  if (is_panel_in_bar) {
    return "flex min-h-0 flex-col justify-center gap-0.5 rounded-sm border border-panel-border bg-[color-mix(in_srgb,var(--panel)_55%,var(--background))] px-2.5 py-2";
  }

  return "flex flex-col gap-0.5 rounded-sm border border-panel-border bg-[color-mix(in_srgb,var(--panel)_55%,var(--background))] px-2.5 py-2";
}
