'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { create_browser_supabase_client } from '@/lib/create_browser_supabase_client'
import { get_button_class_name } from '@/lib/get_button_class_name'
import { is_supabase_configured } from '@/lib/is_supabase_configured'

/**
 * Cloud account status and sign-out control for Settings.
 */
export function CloudAccountSetting(): React.ReactElement | null {
  const router = useRouter()
  const [email, set_email] = useState<string | null>(null)
  const [is_pending, set_is_pending] = useState(false)

  useEffect(() => {
    if (!is_supabase_configured()) {
      return
    }

    const supabase = create_browser_supabase_client()

    void supabase.auth.getUser().then(({ data: { user } }) => {
      set_email(user?.email ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set_email(session?.user.email ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (!is_supabase_configured()) {
    return null
  }

  const handle_sign_out = async (): Promise<void> => {
    set_is_pending(true)

    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      const supabase = create_browser_supabase_client()
      await supabase.auth.signOut()
      router.refresh()
    } finally {
      set_is_pending(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="m-0 text-[0.95rem] font-semibold">Cloud sync</h2>
        <p className="m-0 text-[0.8rem] leading-snug text-muted">
          When signed in, tracker data and settings sync to your Supabase project
          instead of the local db.json file.
        </p>
      </div>
      {email === null ? (
        <Link
          href="/login?next=/settings/data"
          className={`${get_button_class_name('primary', 'small')} self-start no-underline`}
        >
          Sign in to enable cloud sync
        </Link>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-[0.85rem]">
            Signed in as <span className="font-semibold">{email}</span>
          </p>
          <button
            type="button"
            className={`${get_button_class_name('ghost', 'small')} self-start`}
            disabled={is_pending}
            onClick={() => void handle_sign_out()}
          >
            {is_pending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  )
}
