'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { use_supabase_auth_session } from '@/lib/use_supabase_auth_session'

const nav_link_class_name =
  'rounded-full px-3 py-1.5 text-[0.85rem] font-semibold text-muted no-underline hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-55'

/**
 * Sign-in and sign-out controls for the app topbar.
 */
export function TopbarAuthNav(): React.ReactElement | null {
  const pathname = usePathname() ?? '/'
  const { email, is_configured, is_pending, sign_out } = use_supabase_auth_session()

  if (!is_configured) {
    return null
  }

  if (email === null) {
    const login_href = `/login?next=${encodeURIComponent(pathname)}`

    return (
      <Link className={nav_link_class_name} href={login_href}>
        Sign in
      </Link>
    )
  }

  return (
    <>
      <span
        className="hidden max-w-40 truncate text-[0.8rem] text-muted sm:inline"
        title={email}
      >
        {email}
      </span>
      <button
        type="button"
        className={nav_link_class_name}
        disabled={is_pending}
        onClick={() => void sign_out()}
      >
        {is_pending ? 'Signing out…' : 'Sign out'}
      </button>
    </>
  )
}
