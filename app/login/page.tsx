import { AuthPageLayout } from '@/components/auth-page-layout'
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
    <AuthPageLayout
      breadcrumb={{
        current: 'Sign in',
        parent: { label: 'Tracker', href: '/' },
      }}
      title="Cloud sync sign in"
      description="Sign in to store sheets, entries, and settings in Supabase. Your local db.json is imported automatically the first time the cloud database is empty."
    >
      {!is_supabase_configured() ? (
        <p className="m-0 text-[0.85rem] text-danger">
          Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY,
          then restart the app.
        </p>
      ) : (
        <>
          {auth_error ? (
            <p className="m-0 mb-3 text-[0.85rem] text-danger">
              Sign-in failed. Try again or use the email link from your inbox.
            </p>
          ) : null}
          <SupabaseAuthForm mode="sign_in" redirect_to={redirect_to} />
        </>
      )}
    </AuthPageLayout>
  )
}
