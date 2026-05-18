type PreferenceListener = () => void

export interface UiPreferenceStore<T extends string> {
  storage_key: string
  default_value: T
  is_valid: (value: string) => value is T
  read: () => T
  write: (value: T) => void
  subscribe: (listener: PreferenceListener) => () => void
  notify: () => void
  get_snapshot: () => T
  get_server_snapshot: () => T
}

export interface CreateUiPreferenceStoreArgs<T extends string> {
  storage_key: string
  default_value: T
  is_valid: (value: string) => value is T
}

/**
 * Creates a localStorage-backed preference store with subscribe/snapshot helpers.
 */
export function create_ui_preference_store<T extends string>(
  args: CreateUiPreferenceStoreArgs<T>,
): UiPreferenceStore<T> {
  const { default_value, is_valid, storage_key } = args
  const listeners = new Set<PreferenceListener>()

  const read = (): T => {
    if (typeof window === 'undefined') {
      return default_value
    }

    try {
      const raw = window.localStorage.getItem(storage_key)

      if (raw !== null && is_valid(raw)) {
        return raw
      }
    } catch {
      // Ignore storage failures.
    }

    return default_value
  }

  const write = (value: T): void => {
    try {
      window.localStorage.setItem(storage_key, value)
    } catch {
      // Ignore storage failures.
    }
  }

  const subscribe = (listener: PreferenceListener): (() => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  const notify = (): void => {
    listeners.forEach((listener) => {
      listener()
    })
  }

  return {
    storage_key,
    default_value,
    is_valid,
    read,
    write,
    subscribe,
    notify,
    get_snapshot: read,
    get_server_snapshot: () => default_value,
  }
}
