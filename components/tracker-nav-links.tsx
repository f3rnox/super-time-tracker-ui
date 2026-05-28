'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  match: (pathname: string) => boolean
}

const nav_items: NavItem[] = [
  {
    href: '/',
    label: 'Tracker',
    match: (pathname) => pathname === '/',
  },
  {
    href: '/today',
    label: 'Today',
    match: (pathname) => pathname.startsWith('/today'),
  },
  {
    href: '/pomodoro',
    label: 'Pomodoro',
    match: (pathname) => pathname.startsWith('/pomodoro'),
  },
  {
    href: '/sheets',
    label: 'Sheets',
    match: (pathname) => pathname.startsWith('/sheets'),
  },
  {
    href: '/reporting',
    label: 'Reporting',
    match: (pathname) => pathname.startsWith('/reporting'),
  },
]

const link_base_class =
  'rounded-full px-3 py-1.5 text-[0.85rem] font-semibold no-underline transition-colors duration-150'

/**
 * Primary app navigation links for the top bar.
 */
export function TrackerNavLinks() {
  const pathname = usePathname() ?? '/'

  return (
    <>
      {nav_items.map((item) => {
        const is_active = item.match(pathname)

        return (
          <Link
            key={item.href}
            className={`${link_base_class} ${
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
    </>
  )
}
