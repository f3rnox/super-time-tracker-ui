import { type JSONTimeTrackerDB } from '@/lib/types'

/**
 * Returns whether a value looks like a serialized time tracker database.
 */
export function is_json_time_tracker_db(value: unknown): value is JSONTimeTrackerDB {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as JSONTimeTrackerDB

  return Array.isArray(candidate.sheets)
}
