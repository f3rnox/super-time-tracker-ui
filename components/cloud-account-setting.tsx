'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { get_button_class_name } from '@/lib/get_button_class_name'
import { use_supabase_auth_session } from '@/lib/use_supabase_auth_session'

/**
 * Cloud account status and sign-out control for Settings.
 */
export function CloudAccountSetting(): React.ReactElement | null {
  const pathname = usePathname() ?? '/settings/data'
  const { email, is_configured, is_pending, sign_out } = use_supabase_auth_session()

  if (!is_configured) {
    return null
  }

  const login_href = `/login?next=${encodeURIComponent(pathname)}`

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
          href={login_href}
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
            onClick={() => void sign_out()}
          >
            {is_pending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  )
}
