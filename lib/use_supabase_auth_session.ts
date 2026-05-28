'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { create_browser_supabase_client } from '@/lib/create_browser_supabase_client'
import { is_supabase_configured } from '@/lib/is_supabase_configured'
import { notify_settings_saved } from '@/lib/notify_settings_saved'

export interface SupabaseAuthSession {
  is_configured: boolean
  email: string | null
  is_pending: boolean
  sign_out: () => Promise<void>
}

/**
 * Tracks the current Supabase auth session for client UI.
 */
export function use_supabase_auth_session(): SupabaseAuthSession {
  const router = useRouter()
  const [email, set_email] = useState<string | null>(null)
  const [is_pending, set_is_pending] = useState(false)
  const is_configured = is_supabase_configured()

  useEffect(() => {
    if (!is_configured) {
      return
    }

    const supabase = create_browser_supabase_client()

    void supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        set_email(session?.user.email ?? null)
      })
      .catch(() => {
        set_email(null)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set_email(session?.user.email ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [is_configured])

  const sign_out = useCallback(async (): Promise<void> => {
    set_is_pending(true)

    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      const supabase = create_browser_supabase_client()
      await supabase.auth.signOut().catch(() => {
        return
      })
      notify_settings_saved('Signed out')
      router.refresh()
    } finally {
      set_is_pending(false)
    }
  }, [router])

  return {
    is_configured,
    email,
    is_pending,
    sign_out,
  }
}
