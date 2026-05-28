const MERGED_SESSION_STORAGE_KEY = "super-time-tracker-db-merged-session";

/**
 * Returns whether tracker data was already merged this browser tab session.
 */
export function has_tracker_db_merged_this_browser_session(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return sessionStorage.getItem(MERGED_SESSION_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Records that tracker data was merged for this browser tab session.
 */
export function mark_tracker_db_merged_this_browser_session(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(MERGED_SESSION_STORAGE_KEY, "1");
  } catch {
    // Ignore storage failures.
  }
}

/**
 * Clears the merge-on-load flag (e.g. after sign-out).
 */
export function clear_tracker_db_merged_this_browser_session(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.removeItem(MERGED_SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}
