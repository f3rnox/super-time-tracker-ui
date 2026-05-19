export type AuthPageMode = 'sign_in' | 'sign_up'

/**
 * Builds a login or register URL preserving the post-auth redirect path.
 */
export function build_auth_page_href(
  mode: AuthPageMode,
  redirect_to: string,
): string {
  const path = mode === 'sign_in' ? '/login' : '/register'
  const next = redirect_to.trim()

  if (next.length === 0 || next === '/') {
    return path
  }

  return `${path}?next=${encodeURIComponent(next)}`
}
