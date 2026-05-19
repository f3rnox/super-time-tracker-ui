import { NextResponse } from 'next/server'

import { create_server_supabase_client } from '@/lib/create_server_supabase_client'

/**
 * Signs out the current Supabase session.
 */
export async function POST(): Promise<NextResponse> {
  const supabase = await create_server_supabase_client()

  await supabase.auth.signOut()

  return NextResponse.json({ ok: true })
}
