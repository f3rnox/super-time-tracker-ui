'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { get_input_class_name } from '@/lib/get_input_class_name'
import { type CommandPaletteItem } from '@/lib/types/command_palette'

interface CommandPaletteProps {
  items: CommandPaletteItem[]
  query: string
  is_loading: boolean
  error: string | null
  on_query_change: (query: string) => void
  on_select: (item: CommandPaletteItem) => void
  on_close: () => void
}

/**
 * Modal command palette with fuzzy search and keyboard navigation.
 */
export function CommandPalette({
  items,
  query,
  is_loading,
  error,
  on_query_change,
  on_select,
  on_close,
}: CommandPaletteProps) {
  const title_id = useId()
  const input_ref = useRef<HTMLInputElement>(null)
  const [active_index, set_active_index] = useState(0)

  const grouped_items = useMemo(() => group_command_palette_items(items), [items])

  const flat_items = useMemo(
    () => grouped_items.flatMap((group) => group.items),
    [grouped_items],
  )

  const item_index_by_id = useMemo(() => {
    const indices = new Map<string, number>()

    flat_items.forEach((item, index) => {
      indices.set(item.id, index)
    })

    return indices
  }, [flat_items])

  const clamped_active_index =
    flat_items.length === 0 ? 0 : Math.min(active_index, flat_items.length - 1)

  useEffect(() => {
    input_ref.current?.focus()
  }, [])

  const handle_query_change = (value: string): void => {
    set_active_index(0)
    on_query_change(value)
  }

  const handle_key_down = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (
      (event.metaKey || event.ctrlKey) &&
      !event.altKey &&
      event.key.toLowerCase() === 'k'
    ) {
      event.preventDefault()
      event.stopPropagation()
      on_close()
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      on_close()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()

      if (flat_items.length === 0) {
        return
      }

      set_active_index((index) => (index + 1) % flat_items.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()

      if (flat_items.length === 0) {
        return
      }

      set_active_index((index) =>
        index === 0 ? flat_items.length - 1 : index - 1,
      )
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const selected = flat_items[clamped_active_index]

      if (selected !== undefined) {
        on_select(selected)
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center p-4 pt-[12vh] sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default border-0 bg-overlay p-0"
        aria-label="Dismiss command palette"
        onClick={on_close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title_id}
        data-command-palette-dialog="true"
        className="relative z-1 flex w-full max-w-xl flex-col overflow-hidden rounded-lg border border-panel-border bg-panel shadow-lg"
      >
        <p id={title_id} className="sr-only">
          Command palette
        </p>
        <div className="border-b border-panel-border px-3 py-3">
          <label className="sr-only" htmlFor={`${title_id}-input`}>
            Search commands
          </label>
          <input
            ref={input_ref}
            id={`${title_id}-input`}
            type="search"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search sheets, entries, templates, reporting…"
            className={get_input_class_name('compact')}
            value={query}
            onChange={(event) => handle_query_change(event.target.value)}
            onKeyDown={handle_key_down}
          />
        </div>

        <div
          className="max-h-[min(24rem,55vh)] overflow-y-auto px-2 py-2"
          aria-live="polite"
        >
          {error !== null ? (
            <p className="m-0 px-2 py-3 text-[0.85rem] text-danger">{error}</p>
          ) : null}

          {is_loading && flat_items.length === 0 ? (
            <p className="m-0 px-2 py-3 text-[0.85rem] text-muted">Loading…</p>
          ) : null}

          {!is_loading && flat_items.length === 0 && error === null ? (
            <p className="m-0 px-2 py-3 text-[0.85rem] text-muted">
              No matching commands.
            </p>
          ) : null}

          {grouped_items.map((group) => (
            <section key={group.label} className="mb-2 last:mb-0" aria-label={group.label}>
              <h2 className="m-0 px-2 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
                {group.label}
              </h2>
              <ul className="m-0 list-none p-0">
                {group.items.map((item) => {
                  const item_index = item_index_by_id.get(item.id) ?? 0
                  const is_active = item_index === clamped_active_index

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`flex w-full cursor-pointer flex-col gap-0.5 rounded-md border-0 px-2.5 py-2 text-left font-inherit transition-colors duration-150 ${
                          is_active
                            ? 'bg-accent-soft text-foreground'
                            : 'bg-transparent text-inherit hover:bg-surface-hover'
                        }`}
                        onMouseEnter={() => set_active_index(item_index)}
                        onClick={() => on_select(item)}
                      >
                        <span className="text-[0.9rem] font-semibold">
                          {item.title}
                        </span>
                        {item.subtitle !== undefined ? (
                          <span className="text-[0.78rem] text-muted">
                            {item.subtitle}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>

        <div className="border-t border-panel-border px-3 py-2 text-[0.72rem] text-muted">
          <span className="font-mono">↑↓</span> navigate ·{' '}
          <span className="font-mono">↵</span> select ·{' '}
          <span className="font-mono">esc</span> close ·{' '}
          <span className="font-mono">Ctrl+P</span> toggle
        </div>
      </div>
    </div>
  )
}

function group_command_palette_items(
  items: CommandPaletteItem[],
): { label: string; items: CommandPaletteItem[] }[] {
  const groups = new Map<string, CommandPaletteItem[]>()

  for (const item of items) {
    const existing = groups.get(item.group) ?? []
    existing.push(item)
    groups.set(item.group, existing)
  }

  return Array.from(groups.entries()).map(([label, group_items]) => ({
    label,
    items: group_items,
  }))
}
