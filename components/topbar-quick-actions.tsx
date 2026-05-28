'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useSyncExternalStore } from 'react'

import { parse_topbar_quick_actions } from '@/lib/parse_topbar_quick_actions'
import { topbar_quick_actions_preference } from '@/lib/preferences/topbar_quick_actions_preference'
import { type TopbarQuickActionId } from '@/lib/types/quick_actions'

interface TopbarQuickActionItem {
  id: TopbarQuickActionId
  href: string
  label: string
}

const topbar_quick_action_items: TopbarQuickActionItem[] = [
  { id: 'today', href: '/today', label: 'Today' },
  { id: 'search', href: '/search', label: 'Search' },
  { id: 'sheets', href: '/sheets', label: 'Sheets' },
  { id: 'reporting', href: '/reporting', label: 'Reporting' },
  { id: 'pomodoro', href: '/pomodoro', label: 'Pomodoro' },
  { id: 'manage-tags', href: '/settings/tags', label: 'Tags' },
  { id: 'sync-settings', href: '/settings/cloud-sync', label: 'Sync' },
]

const link_base_class =
  'rounded-full px-2.5 py-1 text-[0.78rem] font-semibold no-underline transition-colors duration-150'

/**
 * Optional topbar quick links configured from settings.
 */
export function TopbarQuickActions() {
  const pathname = usePathname() ?? '/'
  const selected_json = useSyncExternalStore(
    topbar_quick_actions_preference.subscribe,
    topbar_quick_actions_preference.get_snapshot,
    topbar_quick_actions_preference.get_server_snapshot,
  )
  const selected = useMemo(
    () => parse_topbar_quick_actions(selected_json),
    [selected_json],
  )

  if (selected.length === 0) {
    return null
  }

  const visible_items = topbar_quick_action_items.filter((item) =>
    selected.includes(item.id),
  )

  if (visible_items.length === 0) {
    return null
  }

  return (
    <div className="hidden items-center gap-1 min-[980px]:flex">
      {visible_items.map((item) => {
        const is_active = pathname.startsWith(item.href)

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`${link_base_class} ${
              is_active
                ? 'bg-accent-soft text-foreground'
                : 'text-muted hover:bg-surface-hover hover:text-foreground'
            }`}
            aria-current={is_active ? 'page' : undefined}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
