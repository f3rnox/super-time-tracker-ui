/**
 * Returns whether Supabase environment variables are present.
 */
export function is_supabase_configured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

  return url.length > 0 && anon_key.length > 0;
}
