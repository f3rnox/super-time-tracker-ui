import { NextResponse } from 'next/server'

import { create_server_supabase_client } from '@/lib/create_server_supabase_client'
import { import_local_db_to_supabase } from '@/lib/import_local_db_to_supabase'

/**
 * Handles Supabase OAuth and email confirmation redirects.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next_path = searchParams.get('next') ?? '/'

  if (code === null) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  const supabase = await create_server_supabase_client()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error !== null) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user !== null) {
    await import_local_db_to_supabase(user.id)
  }

  return NextResponse.redirect(`${origin}${next_path}`)
}
