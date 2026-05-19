'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { apply_ui_preferences_record } from '@/lib/apply_ui_preferences_record'
import { collect_ui_preferences_from_window } from '@/lib/collect_ui_preferences_from_window'
import { create_browser_supabase_client } from '@/lib/create_browser_supabase_client'
import { is_supabase_configured } from '@/lib/is_supabase_configured'
import { run_tracker_db_cloud_sync } from '@/lib/run_tracker_db_cloud_sync'

/**
 * Pulls cloud UI preferences after sign-in and refreshes server state.
 */
export function CloudSyncProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const router = useRouter()
  const did_merge_on_session_ref = useRef(false)

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

    const start_session_sync = (refresh_after: boolean): void => {
      if (did_merge_on_session_ref.current) {
        return
      }

      did_merge_on_session_ref.current = true

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
          did_merge_on_session_ref.current = false
        })
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
        start_session_sync(true)
        return
      }

      if (event === 'SIGNED_OUT') {
        did_merge_on_session_ref.current = false
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return <>{children}</>
}
