import { NextResponse } from 'next/server'

import { api_error_response } from '@/lib/api_error_response'
import { get_authenticated_user_id } from '@/lib/get_authenticated_user_id'
import { push_local_db_to_supabase } from '@/lib/push_local_db_to_supabase'

/**
 * Overwrites cloud tracker data with the local db.json.
 */
export async function POST(): Promise<NextResponse> {
  try {
    const user_id = await get_authenticated_user_id()

    if (user_id === null) {
      return api_error_response(new Error('Sign in required'), 401)
    }

    await push_local_db_to_supabase(user_id)

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    return api_error_response(error, 500)
  }
}
