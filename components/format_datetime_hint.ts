import { format } from "date-fns";

/**
 * Formats an ISO timestamp as a readable hint for edit forms.
 */
export function format_datetime_hint(iso: string): string {
  return format(new Date(iso), "MMM d, h:mm a");
}
