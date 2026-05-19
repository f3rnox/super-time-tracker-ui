import { NextResponse } from 'next/server'

import { api_error_response } from '@/lib/api_error_response'
import { get_authenticated_user_id } from '@/lib/get_authenticated_user_id'
import { push_local_db_to_supabase } from '@/lib/push_local_db_to_supabase'
import { write_local_tracker_db_to_supabase } from '@/lib/write_local_tracker_db_to_supabase'

/**
 * Uploads local db.json to Supabase (merge or verbatim).
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user_id = await get_authenticated_user_id()

    if (user_id === null) {
      return api_error_response(new Error('Sign in required'), 401)
    }

    const verbatim =
      new URL(request.url).searchParams.get('verbatim') === 'true'

    if (verbatim) {
      await write_local_tracker_db_to_supabase(user_id)
    } else {
      await push_local_db_to_supabase(user_id)
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    return api_error_response(error, 500)
  }
}
