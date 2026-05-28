/**
 * Returns the submit button label for the Supabase auth form.
 */
export function get_supabase_auth_submit_label(
  is_sign_up: boolean,
  is_pending: boolean,
): string {
  if (is_pending) {
    return "Working…";
  }

  if (is_sign_up) {
    return "Create account";
  }

  return "Sign in";
}
