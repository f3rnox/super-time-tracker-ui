import { type WeekStartsOn } from "@/lib/types/ui_preferences";

/**
 * Maps the week-starts-on preference to a date-fns week start index.
 */
export function week_starts_on_to_index(value: WeekStartsOn): 0 | 1 {
  return value === "sunday" ? 0 : 1;
}
