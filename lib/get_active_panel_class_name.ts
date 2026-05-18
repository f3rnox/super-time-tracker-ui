/**
 * Returns Tailwind classes for the active entry panel container.
 */
export function get_active_panel_class_name(
  in_bar: boolean,
  is_editing: boolean,
): string {
  const base =
    'flex flex-col gap-4 rounded-lg border border-accent-border p-[1.1rem] shadow-sm'

  if (!in_bar) {
    return `${base} bg-[image:var(--active-panel-bg)]`
  }

  if (is_editing) {
    return `${base} rounded-md border border-accent-border bg-[color-mix(in_srgb,var(--panel)_70%,var(--background))] p-3.5`
  }

  return 'flex flex-col gap-3.5 border-0 bg-transparent p-0 shadow-none'
}
