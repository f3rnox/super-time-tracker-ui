'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { collect_ui_preferences_from_window } from '@/lib/collect_ui_preferences_from_window'
import { create_browser_supabase_client } from '@/lib/create_browser_supabase_client'
import { build_auth_page_href, type AuthPageMode } from '@/lib/build_auth_page_href'
import { get_button_class_name } from '@/lib/get_button_class_name'
import { get_input_class_name } from '@/lib/get_input_class_name'
import { is_auth_form_submittable } from '@/lib/is_auth_form_submittable'
import { is_supabase_configured } from '@/lib/is_supabase_configured'

interface SupabaseAuthFormProps {
  mode: AuthPageMode
  redirect_to?: string
}

/**
 * Email sign-in or register form for Supabase cloud sync.
 */
export function SupabaseAuthForm({
  mode,
  redirect_to = '/',
}: SupabaseAuthFormProps): React.ReactElement {
  const router = useRouter()
  const [email, set_email] = useState('')
  const [password, set_password] = useState('')
  const [password_confirm, set_password_confirm] = useState('')
  const [error, set_error] = useState<string | null>(null)
  const [status, set_status] = useState<string | null>(null)
  const [is_pending, set_is_pending] = useState(false)

  const is_sign_up = mode === 'sign_up'
  const alternate_href = build_auth_page_href(
    is_sign_up ? 'sign_in' : 'sign_up',
    redirect_to,
  )

  const can_submit = is_auth_form_submittable({
    email,
    password,
    password_confirm,
    is_sign_up,
  })

  const passwords_mismatch =
    is_sign_up &&
    password_confirm.length > 0 &&
    password !== password_confirm

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

    if (!can_submit) {
      return
    }

    set_is_pending(true)
    set_error(null)
    set_status(null)

    const supabase = create_browser_supabase_client()
    const trimmed_email = email.trim()

    try {
      if (is_sign_up) {
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
      className="flex w-full flex-col gap-3"
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
          autoComplete={is_sign_up ? 'new-password' : 'current-password'}
          required
          minLength={8}
          className={get_input_class_name()}
          value={password}
          onChange={(event) => set_password(event.target.value)}
        />
      </label>
      {is_sign_up ? (
        <label className="flex flex-col gap-1 text-[0.85rem]">
          <span className="font-semibold">Confirm password</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className={get_input_class_name()}
            value={password_confirm}
            onChange={(event) => set_password_confirm(event.target.value)}
          />
        </label>
      ) : null}
      {passwords_mismatch ? (
        <p className="m-0 text-[0.82rem] text-danger">
          Passwords do not match.
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="submit"
          className={get_button_class_name('primary')}
          disabled={is_pending || !can_submit}
        >
          {is_pending
            ? 'Working…'
            : is_sign_up
              ? 'Create account'
              : 'Sign in'}
        </button>
        <Link
          href={alternate_href}
          className={`${get_button_class_name('ghost', 'small')} no-underline`}
        >
          {is_sign_up ? 'Already have an account?' : 'Need an account?'}
        </Link>
      </div>
      {status !== null ? (
        <p className="m-0 text-center text-[0.82rem] text-accent">{status}</p>
      ) : null}
      {error !== null ? (
        <p className="m-0 text-center text-[0.82rem] text-danger">{error}</p>
      ) : null}
    </form>
  )
}
