import { format } from "date-fns";

/**
 * Formats an ISO timestamp for display in entry lists.
 */
export function format_time(iso: string): string {
  return format(new Date(iso), "h:mm a");
}
