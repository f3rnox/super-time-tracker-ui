import { NextResponse } from 'next/server'

import { api_error_response } from '@/lib/api_error_response'
import { get_authenticated_user_id } from '@/lib/get_authenticated_user_id'
import { pull_supabase_db_to_local } from '@/lib/pull_supabase_db_to_local'

/**
 * Overwrites the local db.json with the cloud tracker data.
 */
export async function POST(): Promise<NextResponse> {
  try {
    const user_id = await get_authenticated_user_id()

    if (user_id === null) {
      return api_error_response(new Error('Sign in required'), 401)
    }

    await pull_supabase_db_to_local(user_id)

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    return api_error_response(error, 500)
  }
}
