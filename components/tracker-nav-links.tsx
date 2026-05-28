'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useSyncExternalStore } from 'react'

import { parse_topbar_quick_actions } from '@/lib/parse_topbar_quick_actions'
import { topbar_quick_actions_preference } from '@/lib/preferences/topbar_quick_actions_preference'

interface NavItem {
  href: string
  label: string
  match: (pathname: string) => boolean
}

const base_nav_items: NavItem[] = [
  { href: '/', label: 'Tracker', match: (pathname) => pathname === '/' },
  { href: '/sheets', label: 'Sheets', match: (pathname) => pathname.startsWith('/sheets') },
]

const quick_nav_item_map: Record<string, NavItem> = {
  today: {
    href: '/today',
    label: 'Today',
    match: (pathname) => pathname.startsWith('/today'),
  },
  sheets: {
    href: '/sheets',
    label: 'Sheets',
    match: (pathname) => pathname.startsWith('/sheets'),
  },
  reporting: {
    href: '/reporting',
    label: 'Reporting',
    match: (pathname) => pathname.startsWith('/reporting'),
  },
  pomodoro: {
    href: '/pomodoro',
    label: 'Pomodoro',
    match: (pathname) => pathname.startsWith('/pomodoro'),
  },
  'manage-tags': {
    href: '/settings/tags',
    label: 'Tags',
    match: (pathname) => pathname.startsWith('/settings/tags'),
  },
  'sync-settings': {
    href: '/settings/cloud-sync',
    label: 'Sync',
    match: (pathname) => pathname.startsWith('/settings/cloud-sync'),
  },
}

const link_base_class =
  'rounded-full px-3 py-1.5 text-[0.85rem] font-semibold no-underline transition-colors duration-150'

/**
 * Primary app navigation links for the top bar.
 */
export function TrackerNavLinks() {
  const pathname = usePathname() ?? '/'
  const topbar_quick_actions_json = useSyncExternalStore(
    topbar_quick_actions_preference.subscribe,
    topbar_quick_actions_preference.get_snapshot,
    topbar_quick_actions_preference.get_server_snapshot,
  )
  const topbar_quick_actions = useMemo(
    () => parse_topbar_quick_actions(topbar_quick_actions_json),
    [topbar_quick_actions_json],
  )
  const nav_items = useMemo(() => {
    const mapped_quick_items = topbar_quick_actions
      .map((action_id) => quick_nav_item_map[action_id])
      .filter((item): item is NavItem => item !== undefined)

    return [...base_nav_items, ...mapped_quick_items].filter(
      (item, index, items) => items.findIndex((candidate) => candidate.href === item.href) === index,
    )
  }, [topbar_quick_actions])

  return (
    <div className="scrollbar-none flex min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap py-0.5 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-[980px]:overflow-visible">
      {nav_items.map((item) => {
        const is_active = item.match(pathname)

        return (
          <Link
            key={item.href}
            className={`${link_base_class} shrink-0 ${
              is_active
                ? 'bg-accent-soft text-foreground'
                : 'text-muted hover:bg-surface-hover hover:text-foreground'
            }`}
            href={item.href}
            aria-current={is_active ? 'page' : undefined}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
