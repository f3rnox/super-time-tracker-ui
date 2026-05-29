import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { get_supabase_env } from "@/lib/get_supabase_env";

export interface ProxySupabaseClients {
  supabase: SupabaseClient;
  response: NextResponse;
}

/**
 * Creates a Supabase client for Next.js proxy session refresh.
 */
export function create_proxy_supabase_client(
  request: NextRequest,
): ProxySupabaseClients {
  let response = NextResponse.next();
  const { anon_key, url } = get_supabase_env();

  const supabase = createServerClient(url, anon_key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookies_to_set) {
        cookies_to_set.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next();
        cookies_to_set.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  return { supabase, response };
}
