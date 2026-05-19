import { type NextRequest, NextResponse } from 'next/server'

import { create_middleware_supabase_client } from '@/lib/create_middleware_supabase_client'
import { is_supabase_configured } from '@/lib/is_supabase_configured'

/**
 * Refreshes Supabase auth sessions for cookie-based sign-in.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (!is_supabase_configured()) {
    return NextResponse.next()
  }

  const { supabase, response } = create_middleware_supabase_client(request)

  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
