type PinnedSheetListener = () => void

export const PINNED_SHEET_NAMES_STORAGE_KEY =
  'super-time-tracker-pinned-sheet-names'

const listeners = new Set<PinnedSheetListener>()

/**
 * Stable empty list for useSyncExternalStore server snapshots.
 */
export const EMPTY_PINNED_SHEET_NAMES: readonly string[] = []

let snapshot_cache: { key: string; snapshot: readonly string[] } | null = null

/**
 * Reads pinned sheet names from localStorage.
 */
export function read_pinned_sheet_names(): string[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(PINNED_SHEET_NAMES_STORAGE_KEY)

    if (raw === null) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((value): value is string => typeof value === 'string')
  } catch {
    return []
  }
}

/**
 * Persists pinned sheet names to localStorage.
 */
export function write_pinned_sheet_names(names: string[]): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(
      PINNED_SHEET_NAMES_STORAGE_KEY,
      JSON.stringify(names),
    )
  } catch {
    // Ignore storage failures.
  }

  snapshot_cache = null

  listeners.forEach((listener) => {
    listener()
  })
}

/**
 * Subscribes to pinned sheet name changes.
 */
export function subscribe_pinned_sheet_names(
  listener: PinnedSheetListener,
): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

/**
 * Returns a stable snapshot reference for pinned sheet names.
 */
export function get_stable_pinned_sheet_names_snapshot(
  names: string[],
): readonly string[] {
  if (names.length === 0) {
    return EMPTY_PINNED_SHEET_NAMES
  }

  const key = names.join('\0')

  if (snapshot_cache !== null && snapshot_cache.key === key) {
    return snapshot_cache.snapshot
  }

  const snapshot = Object.freeze([...names])
  snapshot_cache = { key, snapshot }

  return snapshot
}

/**
 * Snapshot for useSyncExternalStore on the client.
 */
export function get_pinned_sheet_names_snapshot(): readonly string[] {
  return get_stable_pinned_sheet_names_snapshot(read_pinned_sheet_names())
}

/**
 * Server render snapshot for pinned sheets.
 */
export function get_pinned_sheet_names_server_snapshot(): readonly string[] {
  return EMPTY_PINNED_SHEET_NAMES
}
