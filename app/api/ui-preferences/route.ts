import { NextResponse } from 'next/server'

import { api_error_response } from '@/lib/api_error_response'
import { type UiPreferencesRecord } from '@/lib/collect_ui_preferences_from_window'
import { get_authenticated_user_id } from '@/lib/get_authenticated_user_id'
import { read_supabase_ui_preferences } from '@/lib/read_supabase_ui_preferences'
import { write_supabase_ui_preferences } from '@/lib/write_supabase_ui_preferences'

interface UiPreferencesBody {
  preferences?: UiPreferencesRecord
}

/**
 * Returns synced UI preferences for the signed-in user.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const user_id = await get_authenticated_user_id()

    if (user_id === null) {
      return api_error_response(new Error('Sign in required'), 401)
    }

    const preferences = await read_supabase_ui_preferences(user_id)

    return NextResponse.json({ preferences })
  } catch (error: unknown) {
    return api_error_response(error, 500)
  }
}

/**
 * Merges UI preferences from the client into the cloud record.
 */
export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const user_id = await get_authenticated_user_id()

    if (user_id === null) {
      return api_error_response(new Error('Sign in required'), 401)
    }

    const body = (await request.json()) as UiPreferencesBody
    const preferences = body.preferences ?? {}

    const merged = await write_supabase_ui_preferences(user_id, preferences)

    return NextResponse.json({ preferences: merged })
  } catch (error: unknown) {
    return api_error_response(error, 500)
  }
}
