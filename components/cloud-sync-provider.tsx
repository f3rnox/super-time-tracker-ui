'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { apply_ui_preferences_record } from '@/lib/apply_ui_preferences_record'
import { collect_ui_preferences_from_window } from '@/lib/collect_ui_preferences_from_window'
import { create_browser_supabase_client } from '@/lib/create_browser_supabase_client'
import { is_supabase_configured } from '@/lib/is_supabase_configured'

/**
 * Pulls cloud UI preferences after sign-in and refreshes server state.
 */
export function CloudSyncProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const router = useRouter()

  useEffect(() => {
    if (!is_supabase_configured()) {
      return
    }

    const supabase = create_browser_supabase_client()

    const sync_on_load = async (): Promise<void> => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session === null) {
        return
      }

      await fetch('/api/sync/merge-on-load', { method: 'POST' })
    }

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

    void sync_preferences()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        void sync_on_load()
          .then(() => sync_preferences())
          .then(() => {
            router.refresh()
          })
        return
      }

      if (event === 'SIGNED_OUT') {
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return <>{children}</>
}
