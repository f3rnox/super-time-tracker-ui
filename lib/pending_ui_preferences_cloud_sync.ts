let pending_while_merge = false

/**
 * Marks that a cloud push was requested while merge-on-load was in progress.
 */
export function mark_pending_ui_preferences_cloud_sync(): void {
  pending_while_merge = true
}

/**
 * Returns whether a deferred push is pending and clears the flag.
 */
export function take_pending_ui_preferences_cloud_sync(): boolean {
  if (!pending_while_merge) {
    return false
  }

  pending_while_merge = false
  return true
}
