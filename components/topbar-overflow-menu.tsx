'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { HamburgerIcon } from '@/components/hamburger-icon'
import { build_auth_page_href } from '@/lib/build_auth_page_href'
import { notify_settings_saved } from '@/lib/notify_settings_saved'
import { parse_topbar_quick_actions } from '@/lib/parse_topbar_quick_actions'
import { parse_tracker_shortcut_map } from '@/lib/parse_tracker_shortcut_map'
import { cloud_sync_enabled_preference } from '@/lib/preferences/cloud_sync_enabled_preference'
import { topbar_quick_actions_preference } from '@/lib/preferences/topbar_quick_actions_preference'
import { tracker_shortcut_map_preference } from '@/lib/preferences/tracker_shortcut_map_preference'
import { run_tracker_db_cloud_sync } from '@/lib/run_tracker_db_cloud_sync'
import { get_theme_server_snapshot, get_theme_snapshot } from '@/lib/get_theme_snapshot'
import { subscribe_theme } from '@/lib/subscribe_theme'
import { toggle_theme } from '@/lib/toggle_theme'
import { topbar_quick_action_ids, type TopbarQuickActionId } from '@/lib/types/quick_actions'
import { use_escape_to_cancel } from '@/lib/use_escape_to_cancel'
import { use_supabase_auth_session } from '@/lib/use_supabase_auth_session'

const menu_item_class =
  'block w-full cursor-pointer rounded-[0.45rem] border-0 bg-transparent px-2.5 py-1.5 text-left font-inherit text-[0.85rem] text-inherit no-underline hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-55'

const topbar_shortcut_menu_items: Record<
  TopbarQuickActionId,
  { href: string; label: string }
> = {
  today: { href: '/today', label: 'Today' },
  sheets: { href: '/sheets', label: 'Sheets' },
  reporting: { href: '/reporting', label: 'Reporting' },
  pomodoro: { href: '/pomodoro', label: 'Pomodoro' },
  'manage-tags': { href: '/settings/tags', label: 'Manage tags' },
  'sync-settings': { href: '/settings/cloud-sync', label: 'Sync settings' },
}

const always_visible_menu_actions = new Set<TopbarQuickActionId>([
  'manage-tags',
  'pomodoro',
  'sync-settings',
])

/**
 * Hamburger menu containing theme, shortcuts help, and auth controls.
 */
export function TopbarOverflowMenu(): React.ReactElement {
  const router = useRouter()
  const pathname = usePathname() ?? '/'
  const theme = useSyncExternalStore(
    subscribe_theme,
    get_theme_snapshot,
    get_theme_server_snapshot,
  )
  const cloud_sync_enabled = useSyncExternalStore(
    cloud_sync_enabled_preference.subscribe,
    cloud_sync_enabled_preference.get_snapshot,
    cloud_sync_enabled_preference.get_server_snapshot,
  )
  const shortcut_map_json = useSyncExternalStore(
    tracker_shortcut_map_preference.subscribe,
    tracker_shortcut_map_preference.get_snapshot,
    tracker_shortcut_map_preference.get_server_snapshot,
  )
  const topbar_quick_actions_json = useSyncExternalStore(
    topbar_quick_actions_preference.subscribe,
    topbar_quick_actions_preference.get_snapshot,
    topbar_quick_actions_preference.get_server_snapshot,
  )
  const shortcut_map = parse_tracker_shortcut_map(shortcut_map_json)
  const enabled_topbar_shortcuts = new Set<TopbarQuickActionId>(
    parse_topbar_quick_actions(topbar_quick_actions_json),
  )
  const menu_shortcut_actions = topbar_quick_action_ids.filter(
    (action_id) => !enabled_topbar_shortcuts.has(action_id),
  )
  const final_menu_shortcut_actions = Array.from(
    new Set<TopbarQuickActionId>([
      ...Array.from(always_visible_menu_actions),
      ...menu_shortcut_actions,
    ]),
  )
  const { email, is_configured, is_pending, sign_out } = use_supabase_auth_session()

  const [is_open, set_is_open] = useState(false)
  const menu_ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!is_open) {
      return
    }

    const handle_pointer_down = (event: PointerEvent): void => {
      if (
        menu_ref.current !== null &&
        !menu_ref.current.contains(event.target as Node)
      ) {
        set_is_open(false)
      }
    }

    document.addEventListener('pointerdown', handle_pointer_down)

    return () => {
      document.removeEventListener('pointerdown', handle_pointer_down)
    }
  }, [is_open])

  const close_menu = (): void => {
    set_is_open(false)
  }

  use_escape_to_cancel(close_menu, is_open)

  const active_theme_label = theme === 'dark' ? 'Dark' : 'Light'

  const open_shortcuts_dialog = (): void => {
    const help_key = shortcut_map.help
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: help_key,
        shiftKey: help_key === '?',
        bubbles: true,
      }),
    )
  }

  const handle_sign_in = (): void => {
    router.push(build_auth_page_href('sign_in', pathname))
  }

  const toggle_cloud_sync_enabled = (): void => {
    const next_value = cloud_sync_enabled === 'true' ? 'false' : 'true'

    cloud_sync_enabled_preference.write(next_value)
    cloud_sync_enabled_preference.notify()
    notify_settings_saved(
      next_value === 'true' ? 'Cloud sync enabled' : 'Cloud sync disabled',
    )

    if (next_value === 'true' && email !== null) {
      void run_tracker_db_cloud_sync({ merge_on_load: true }).catch(() => {
        // Sync toast already shows the error.
      })
    }
  }

  return (
    <div className="relative shrink-0" ref={menu_ref}>
      <button
        type="button"
        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-panel-border bg-ghost-bg text-muted hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-label="Open menu"
        aria-expanded={is_open}
        aria-haspopup="menu"
        onClick={() => set_is_open((open) => !open)}
      >
        <HamburgerIcon />
      </button>
      {is_open ? (
        <ul
          className="absolute right-0 top-full z-50 mt-1.5 min-w-56 list-none rounded-md border border-panel-border bg-panel p-1.5 shadow-md"
          role="menu"
        >
          {is_configured && email !== null ? (
            <li role="none">
              <p
                className="m-0 truncate px-2.5 py-1 text-[0.72rem] uppercase tracking-[0.04em] text-muted"
                title={email}
              >
                {email}
              </p>
            </li>
          ) : null}
          {final_menu_shortcut_actions.map((action_id) => {
            const item = topbar_shortcut_menu_items[action_id]

            return (
              <li key={action_id} role="none">
                <Link
                  href={item.href}
                  className={menu_item_class}
                  role="menuitem"
                  onClick={close_menu}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
          {is_configured ? (
            <li role="none">
              <button
                type="button"
                className={menu_item_class}
                role="menuitemcheckbox"
                aria-checked={cloud_sync_enabled === 'true'}
                onClick={toggle_cloud_sync_enabled}
              >
                <span className="inline-flex w-full items-center justify-between gap-2">
                  <span>
                    {cloud_sync_enabled === 'true'
                      ? 'Pause cloud sync'
                      : 'Resume cloud sync'}
                  </span>
                  <span className="text-muted" aria-hidden="true">
                    {cloud_sync_enabled === 'true' ? 'On' : 'Off'}
                  </span>
                </span>
              </button>
            </li>
          ) : null}
          <li
            className="my-1 border-t border-panel-border"
            role="separator"
            aria-hidden="true"
          />
          <li role="none">
            <button
              type="button"
              className={menu_item_class}
              role="menuitem"
              onClick={() => {
                close_menu()
                toggle_theme()
              }}
              suppressHydrationWarning
            >
              <span className="inline-flex w-full items-center justify-between gap-2">
                <span>{active_theme_label} theme</span>
                <span aria-hidden="true">{theme === 'dark' ? '☾' : '☀'}</span>
              </span>
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              className={menu_item_class}
              role="menuitem"
              onClick={() => {
                close_menu()
                open_shortcuts_dialog()
              }}
            >
              <span className="inline-flex w-full items-center justify-between gap-2">
                <span>Keyboard shortcuts</span>
                <span className="text-muted" aria-hidden="true">
                  (?)
                </span>
              </span>
            </button>
          </li>
          {is_configured ? (
            <>
              <li
                className="my-1 border-t border-panel-border"
                role="separator"
                aria-hidden="true"
              />
              {email === null ? (
                <li role="none">
                  <button
                    type="button"
                    className={menu_item_class}
                    role="menuitem"
                    onClick={() => {
                      close_menu()
                      handle_sign_in()
                    }}
                  >
                    Sign in
                  </button>
                </li>
              ) : (
                <li role="none">
                  <button
                    type="button"
                    className={`${menu_item_class} text-danger`}
                    role="menuitem"
                    disabled={is_pending}
                    onClick={() => {
                      close_menu()
                      void sign_out()
                    }}
                  >
                    {is_pending ? 'Signing out…' : 'Sign out'}
                  </button>
                </li>
              )}
            </>
          ) : null}
        </ul>
      ) : null}
    </div>
  )
}
