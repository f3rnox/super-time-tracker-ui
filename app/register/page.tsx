import { AuthPageLayout } from '@/components/auth-page-layout'
import { SupabaseAuthForm } from '@/components/supabase-auth-form'
import { build_auth_page_href } from '@/lib/build_auth_page_href'
import { is_supabase_configured } from '@/lib/is_supabase_configured'

interface RegisterPageProps {
  searchParams: Promise<{
    next?: string
  }>
}

/**
 * Register page for Supabase cloud sync.
 */
export default async function RegisterPage({
  searchParams,
}: RegisterPageProps): Promise<React.ReactElement> {
  const params = await searchParams
  const redirect_to = params.next ?? '/'

  return (
    <AuthPageLayout
      breadcrumb={{
        current: 'Register',
        parent: {
          label: 'Sign in',
          href: build_auth_page_href('sign_in', redirect_to),
        },
      }}
      title="Create a cloud sync account"
      description="Register to back up and sync your tracker data and settings to Supabase. You will receive a confirmation email before you can sign in."
    >
      {!is_supabase_configured() ? (
        <p className="m-0 text-[0.85rem] text-danger">
          Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY,
          then restart the app.
        </p>
      ) : (
        <SupabaseAuthForm mode="sign_up" redirect_to={redirect_to} />
      )}
    </AuthPageLayout>
  )
}
