/**
 * Returns true when the value is a defined, non-empty string.
 */
export function has_string_value(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}
