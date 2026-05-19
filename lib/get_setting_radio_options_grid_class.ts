/**
 * Returns Tailwind grid classes for a setting radio option list.
 */
export function get_setting_radio_options_grid_class(option_count: number): string {
  if (option_count <= 2) {
    return 'grid grid-cols-1 gap-1.5 sm:grid-cols-2'
  }

  if (option_count <= 4) {
    return 'grid grid-cols-1 gap-1.5 sm:grid-cols-2'
  }

  return 'grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3'
}
