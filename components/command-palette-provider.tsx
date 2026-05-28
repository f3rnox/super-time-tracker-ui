'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { CommandPalette } from '@/components/command-palette'
import { build_command_palette_items } from '@/lib/build_command_palette_items'
import { build_entry_search_href } from '@/lib/build_entry_search_href'
import { get_empty_entry_search_filters } from '@/lib/parse_entry_search_filters'
import { execute_command_palette_item } from '@/lib/execute_command_palette_item'
import { fetch_command_palette_snapshot } from '@/lib/fetch_command_palette_snapshot'
import { filter_command_palette_items } from '@/lib/filter_command_palette_items'
import {
  type CommandPaletteItem,
  type CommandPaletteSnapshot,
} from '@/lib/types/command_palette'
import { use_command_palette_hotkey } from '@/lib/use_command_palette_hotkey'
import { use_debounced_value } from '@/lib/use_debounced_value'

const empty_snapshot: CommandPaletteSnapshot = {
  activeSheetName: null,
  sheets: [],
  lastCompletedEntry: null,
  matchingEntries: [],
}

/**
 * Global command palette provider (Ctrl+P).
 */
export function CommandPaletteProvider() {
  const router = useRouter()
  const pathname = usePathname() ?? '/'
  const [is_open, set_is_open] = useState(false)
  const [query, set_query] = useState('')
  const debounced_query = use_debounced_value(query, 200)
  const [snapshot, set_snapshot] = useState<CommandPaletteSnapshot>(empty_snapshot)
  const [is_loading, set_is_loading] = useState(false)
  const [error, set_error] = useState<string | null>(null)

  const toggle_palette = useCallback(() => {
    set_is_open((open) => {
      if (open) {
        set_query('')
      }

      return !open
    })
  }, [])

  use_command_palette_hotkey(toggle_palette)

  useEffect(() => {
    if (!is_open) {
      return
    }

    let cancelled = false

    const load_snapshot = async (): Promise<void> => {
      set_is_loading(true)
      set_error(null)

      try {
        const next_snapshot = await fetch_command_palette_snapshot(debounced_query)

        if (!cancelled) {
          set_snapshot(next_snapshot)
        }
      } catch (load_error: unknown) {
        if (!cancelled) {
          set_error(
            load_error instanceof Error ? load_error.message : String(load_error),
          )
        }
      } finally {
        if (!cancelled) {
          set_is_loading(false)
        }
      }
    }

    void load_snapshot()

    return () => {
      cancelled = true
    }
  }, [is_open, debounced_query])

  const items = useMemo((): CommandPaletteItem[] => {
    const built = build_command_palette_items({ snapshot })
    const filtered = filter_command_palette_items(built, query)
    const trimmed_query = query.trim()

    if (trimmed_query.length === 0) {
      return filtered
    }

    const search_all_item: CommandPaletteItem = {
      id: 'search-all-entries',
      kind: 'navigate',
      group: 'Search',
      title: `Search all entries for "${trimmed_query}"`,
      subtitle: 'Open search with filters',
      keywords: ['search', trimmed_query],
      href: build_entry_search_href({
        ...get_empty_entry_search_filters(),
        query: trimmed_query,
      }),
    }

    return [search_all_item, ...filtered]
  }, [snapshot, query])

  const handle_select = useCallback(
    async (item: CommandPaletteItem) => {
      set_is_open(false)
      set_query('')

      try {
        await execute_command_palette_item({
          item,
          pathname,
          navigate: (href) => {
            router.push(href)
          },
        })
      } catch {
        // Errors are surfaced via in-app notifications.
      }
    },
    [pathname, router],
  )

  const handle_close = useCallback(() => {
    set_is_open(false)
    set_query('')
  }, [])

  if (!is_open) {
    return null
  }

  return (
    <CommandPalette
      items={items}
      query={query}
      is_loading={is_loading}
      error={error}
      on_query_change={set_query}
      on_select={(item) => {
        void handle_select(item)
      }}
      on_close={handle_close}
    />
  )
}
