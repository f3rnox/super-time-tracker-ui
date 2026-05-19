import { NextResponse } from 'next/server'

import { api_error_response } from '@/lib/api_error_response'
import { type UiPreferencesRecord } from '@/lib/collect_ui_preferences_from_window'
import { sync_ui_preferences_on_load } from '@/lib/sync_ui_preferences_on_load'

interface MergeOnLoadBody {
  preferences?: UiPreferencesRecord
}

/**
 * Merges client UI preferences with the cloud record on load.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as MergeOnLoadBody
    const local = body.preferences ?? {}
    const result = await sync_ui_preferences_on_load(local)

    return NextResponse.json({
      ok: true,
      synced: result.synced,
      preferences: result.merged,
    })
  } catch (error: unknown) {
    return api_error_response(error, 500)
  }
}
