import { type NextRequest, NextResponse } from "next/server";

import { create_proxy_supabase_client } from "@/lib/create_proxy_supabase_client";
import { is_supabase_configured } from "@/lib/is_supabase_configured";

/**
 * Refreshes Supabase auth sessions for cookie-based sign-in.
 */
export async function proxy(request: ProxyRequest): Promise<ProxyResponse> {
  if (!is_supabase_configured()) {
    return ProxyResponse.next({ request });
  }

  const { supabase, response } = create_proxy_supabase_client(request);

  await supabase.auth.getSession();

  return response;
}

export const config = {
  matcher: [
    String.raw`/((?!_next/static|_next/image|favicon.ico|api/focus-nudges|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)`,
  ],
};
