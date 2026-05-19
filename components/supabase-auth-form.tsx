'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { collect_ui_preferences_from_window } from '@/lib/collect_ui_preferences_from_window'
import { create_browser_supabase_client } from '@/lib/create_browser_supabase_client'
import { get_button_class_name } from '@/lib/get_button_class_name'
import { get_input_class_name } from '@/lib/get_input_class_name'
import { is_supabase_configured } from '@/lib/is_supabase_configured'

interface SupabaseAuthFormProps {
  redirect_to?: string
}

/**
 * Email sign-in and sign-up form for single-user cloud sync.
 */
export function SupabaseAuthForm({ redirect_to = '/' }: SupabaseAuthFormProps) {
  const router = useRouter()
  const [email, set_email] = useState('')
  const [password, set_password] = useState('')
  const [mode, set_mode] = useState<'sign_in' | 'sign_up'>('sign_in')
  const [error, set_error] = useState<string | null>(null)
  const [status, set_status] = useState<string | null>(null)
  const [is_pending, set_is_pending] = useState(false)

  if (!is_supabase_configured()) {
    return (
      <p className="m-0 text-[0.85rem] text-danger">
        Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and
        NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment.
      </p>
    )
  }

  const handle_submit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault()
    set_is_pending(true)
    set_error(null)
    set_status(null)

    const supabase = create_browser_supabase_client()
    const trimmed_email = email.trim()

    try {
      if (mode === 'sign_up') {
        const { error: sign_up_error } = await supabase.auth.signUp({
          email: trimmed_email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect_to)}`,
          },
        })

        if (sign_up_error !== null) {
          throw sign_up_error
        }

        set_status(
          'Check your email to confirm the account, then sign in here.',
        )
        return
      }

      const { error: sign_in_error } = await supabase.auth.signInWithPassword({
        email: trimmed_email,
        password,
      })

      if (sign_in_error !== null) {
        throw sign_in_error
      }

      const import_response = await fetch('/api/sync/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: collect_ui_preferences_from_window(),
        }),
      })

      if (!import_response.ok) {
        const body = (await import_response.json()) as { error?: string }
        throw new Error(body.error ?? 'Cloud import failed')
      }

      router.push(redirect_to)
      router.refresh()
    } catch (submit_error: unknown) {
      set_error(
        submit_error instanceof Error
          ? submit_error.message
          : String(submit_error),
      )
    } finally {
      set_is_pending(false)
    }
  }

  return (
    <form
      className="flex w-full max-w-md flex-col gap-3"
      onSubmit={(event) => void handle_submit(event)}
    >
      <label className="flex flex-col gap-1 text-[0.85rem]">
        <span className="font-semibold">Email</span>
        <input
          type="email"
          autoComplete="email"
          required
          className={get_input_class_name()}
          value={email}
          onChange={(event) => set_email(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-[0.85rem]">
        <span className="font-semibold">Password</span>
        <input
          type="password"
          autoComplete={mode === 'sign_up' ? 'new-password' : 'current-password'}
          required
          minLength={8}
          className={get_input_class_name()}
          value={password}
          onChange={(event) => set_password(event.target.value)}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className={get_button_class_name('primary')}
          disabled={is_pending}
        >
          {is_pending
            ? 'Working…'
            : mode === 'sign_up'
              ? 'Create account'
              : 'Sign in'}
        </button>
        <button
          type="button"
          className={get_button_class_name('ghost', 'small')}
          disabled={is_pending}
          onClick={() => {
            set_mode(mode === 'sign_in' ? 'sign_up' : 'sign_in')
            set_error(null)
            set_status(null)
          }}
        >
          {mode === 'sign_in' ? 'Need an account?' : 'Already have an account?'}
        </button>
      </div>
      {status !== null ? (
        <p className="m-0 text-[0.82rem] text-accent">{status}</p>
      ) : null}
      {error !== null ? (
        <p className="m-0 text-[0.82rem] text-danger">{error}</p>
      ) : null}
    </form>
  )
}
