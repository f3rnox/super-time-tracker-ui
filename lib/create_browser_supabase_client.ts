import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { get_supabase_env } from "@/lib/get_supabase_env";

/**
 * Creates a Supabase client for browser components.
 */
export function create_browser_supabase_client(): SupabaseClient {
  const { anon_key, url } = get_supabase_env();

  return createBrowserClient(url, anon_key);
}
