'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { create_browser_supabase_client } from '@/lib/create_browser_supabase_client'
import { merge_ui_preferences_from_cloud_on_load } from '@/lib/merge_ui_preferences_from_cloud_on_load'
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

    const run_merge_on_load = (refresh_after: boolean): void => {
      void run_tracker_db_cloud_sync({
        merge_on_load: true,
        on_complete: () => {
          router.refresh()
        },
      }).catch(() => {
        // Toast shows the error.
      })
    }

    const start_session_sync = (refresh_after: boolean): void => {
      if (
        !should_merge_tracker_db_on_navigation() &&
        has_tracker_db_merged_this_browser_session()
      ) {
        void merge_ui_preferences_from_cloud_on_load().catch(() => {
          // Ignore; tracker sync toast covers load failures.
        })
        return
      }

      run_merge_on_load(refresh_after)
    }

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session !== null) {
        start_session_sync(false)
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
