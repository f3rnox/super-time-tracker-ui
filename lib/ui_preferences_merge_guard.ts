let active_merge_count = 0

/**
 * Returns whether UI preference cloud pushes should be deferred.
 */
export function is_ui_preferences_merge_in_progress(): boolean {
  return active_merge_count > 0
}

/**
 * Runs async work while blocking debounced UI preference pushes to the cloud.
 */
export async function with_ui_preferences_merge_guard<T>(
  work: () => Promise<T>,
): Promise<T> {
  active_merge_count += 1

  try {
    return await work()
  } finally {
    active_merge_count -= 1
  }
}
