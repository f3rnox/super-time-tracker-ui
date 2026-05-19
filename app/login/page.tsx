import Link from 'next/link'

import { SupabaseAuthForm } from '@/components/supabase-auth-form'
import { is_supabase_configured } from '@/lib/is_supabase_configured'

interface LoginPageProps {
  searchParams: Promise<{
    next?: string
    error?: string
  }>
}

/**
 * Sign-in page for Supabase cloud sync.
 */
export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<React.ReactElement> {
  const params = await searchParams
  const redirect_to = params.next ?? '/'
  const auth_error = params.error === 'auth'

  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-1">
        <Link href="/" className="text-[0.85rem] text-accent no-underline hover:underline">
          ← Back to tracker
        </Link>
        <h1 className="m-0 text-2xl font-semibold">Cloud sync sign in</h1>
        <p className="m-0 text-[0.9rem] text-muted">
          Sign in to store sheets, entries, and settings in Supabase. Your local
          db.json is imported automatically the first time the cloud database is
          empty.
        </p>
      </div>
      {!is_supabase_configured() ? (
        <p className="m-0 text-[0.85rem] text-danger">
          Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY,
          then restart the app.
        </p>
      ) : (
        <>
          {auth_error ? (
            <p className="m-0 text-[0.85rem] text-danger">
              Sign-in failed. Try again or use the email link from your inbox.
            </p>
          ) : null}
          <SupabaseAuthForm redirect_to={redirect_to} />
        </>
      )}
    </main>
  )
}
