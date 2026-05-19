'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { apply_ui_preferences_record } from '@/lib/apply_ui_preferences_record'
import { collect_ui_preferences_from_window } from '@/lib/collect_ui_preferences_from_window'
import { create_browser_supabase_client } from '@/lib/create_browser_supabase_client'
import {
  clear_tracker_db_merged_this_browser_session,
  has_tracker_db_merged_this_browser_session,
} from '@/lib/has_tracker_db_merged_this_browser_session'
import { is_supabase_configured } from '@/lib/is_supabase_configured'
import { run_tracker_db_cloud_sync } from '@/lib/run_tracker_db_cloud_sync'
import { should_merge_tracker_db_on_navigation } from '@/lib/should_merge_tracker_db_on_navigation'

/**
 * Pulls cloud UI preferences after sign-in and refreshes server state.
 */
export function CloudSyncProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const router = useRouter()
  const pathname = usePathname()
  const last_greedy_merged_pathname_ref = useRef<string | null>(null)
  const skip_next_greedy_pathname_sync_ref = useRef(true)

  useEffect(() => {
    if (!is_supabase_configured()) {
      return
    }

    const supabase = create_browser_supabase_client()

    const sync_preferences = async (): Promise<void> => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session === null) {
        return
      }

      const local_preferences = collect_ui_preferences_from_window()

      const response = await fetch('/api/ui-preferences')

      if (!response.ok) {
        if (Object.keys(local_preferences).length > 0) {
          await fetch('/api/ui-preferences', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ preferences: local_preferences }),
          })
        }

        return
      }

      const payload = (await response.json()) as {
        preferences?: Record<string, string>
      }
      const cloud_preferences = payload.preferences ?? {}
      const merged = { ...cloud_preferences, ...local_preferences }

      apply_ui_preferences_record(merged)

      if (Object.keys(local_preferences).length > 0) {
        await fetch('/api/ui-preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferences: local_preferences }),
        })
      }
    }

    const run_merge_on_load = (refresh_after: boolean): void => {
      void run_tracker_db_cloud_sync({
        merge_on_load: true,
        on_complete: refresh_after
          ? () => {
              router.refresh()
            }
          : undefined,
      })
        .then(() => sync_preferences())
        .catch(() => {
          // Toast shows the error.
        })
    }

    const start_session_sync = (refresh_after: boolean): void => {
      if (
        !should_merge_tracker_db_on_navigation() &&
        has_tracker_db_merged_this_browser_session()
      ) {
        void sync_preferences()
        return
      }

      run_merge_on_load(refresh_after)
    }

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session !== null) {
        start_session_sync(false)
      } else {
        void sync_preferences()
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        clear_tracker_db_merged_this_browser_session()
        last_greedy_merged_pathname_ref.current = null
        skip_next_greedy_pathname_sync_ref.current = true
        start_session_sync(true)
        return
      }

      if (event === 'SIGNED_OUT') {
        clear_tracker_db_merged_this_browser_session()
        last_greedy_merged_pathname_ref.current = null
        skip_next_greedy_pathname_sync_ref.current = true
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  useEffect(() => {
    if (!is_supabase_configured() || !should_merge_tracker_db_on_navigation()) {
      return
    }

    if (skip_next_greedy_pathname_sync_ref.current) {
      skip_next_greedy_pathname_sync_ref.current = false
      last_greedy_merged_pathname_ref.current = pathname
      return
    }

    if (last_greedy_merged_pathname_ref.current === pathname) {
      return
    }

    last_greedy_merged_pathname_ref.current = pathname

    void run_tracker_db_cloud_sync({ merge_on_load: true }).catch(() => {
      // Toast shows the error.
    })
  }, [pathname])

  return <>{children}</>
}
