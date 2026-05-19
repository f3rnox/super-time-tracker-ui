'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SettingsNavItem {
  href: string
  label: string
  match: (pathname: string) => boolean
}

const items: SettingsNavItem[] = [
  {
    href: '/settings',
    label: 'General',
    match: (pathname) => pathname === '/settings',
  },
  {
    href: '/settings/display',
    label: 'Display & layout',
    match: (pathname) => pathname.startsWith('/settings/display'),
  },
  {
    href: '/settings/cloud-sync',
    label: 'Cloud sync',
    match: (pathname) => pathname.startsWith('/settings/cloud-sync'),
  },
  {
    href: '/settings/data',
    label: 'Data & backup',
    match: (pathname) => pathname.startsWith('/settings/data'),
  },
  {
    href: '/settings/tags',
    label: 'Tag management',
    match: (pathname) => pathname.startsWith('/settings/tags'),
  },
]

/**
 * Sidebar navigation for the settings sub-pages.
 */
export function SettingsNav() {
  const pathname = usePathname() ?? '/settings'

  return (
    <nav aria-label="Settings sections" className="w-full">
      <ul className="m-0 flex w-full list-none flex-col gap-0.5 p-0">
        {items.map((item) => {
          const is_active = item.match(pathname)

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={is_active ? 'page' : undefined}
                className={`block rounded-md px-3 py-2 text-[0.9rem] no-underline transition-colors duration-150 ${
                  is_active
                    ? 'bg-accent-soft text-foreground'
                    : 'text-muted hover:bg-surface-hover hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
