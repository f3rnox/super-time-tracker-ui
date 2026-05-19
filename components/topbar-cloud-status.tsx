'use client'

import { CloudIcon } from '@/components/cloud-icon'
import { use_supabase_auth_session } from '@/lib/use_supabase_auth_session'

/**
 * Topbar indicator shown when the user is signed in to cloud sync.
 */
export function TopbarCloudStatus(): React.ReactElement | null {
  const { email, is_configured } = use_supabase_auth_session()

  if (!is_configured || email === null) {
    return null
  }

  return (
    <div className="group relative flex items-center">
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-panel-border bg-ghost-bg text-accent"
        aria-label={`Cloud sync active for ${email}`}
        role="img"
      >
        <CloudIcon />
      </span>
      <div
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-50 mt-1.5 w-max max-w-[min(18rem,calc(100vw-2.5rem))] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <div className="rounded-md border border-panel-border bg-panel px-2.5 py-1.5 shadow-md">
          <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-muted">
            Signed in as
          </p>
          <p
            className="m-0 max-w-[16rem] truncate text-[0.82rem] font-medium"
            title={email}
          >
            {email}
          </p>
        </div>
      </div>
    </div>
  )
}
