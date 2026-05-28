import { format } from "date-fns";

import { type TimeFormat } from "@/lib/types/ui_preferences";

/**
 * Formats an ISO timestamp for display in entry lists.
 */
export function format_time(
  iso: string,
  time_format: TimeFormat = "12h",
): string {
  return format(new Date(iso), time_format === "24h" ? "HH:mm" : "h:mm a");
}
