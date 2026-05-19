import { create_server_supabase_client } from '@/lib/create_server_supabase_client'
import { type UiPreferencesRecord } from '@/lib/collect_ui_preferences_from_window'

/**
 * Loads UI preferences for the signed-in user from Supabase.
 */
export async function read_supabase_ui_preferences(
  user_id: string,
): Promise<UiPreferencesRecord> {
  const supabase = await create_server_supabase_client()

  const { data, error } = await supabase
    .from('tracker_accounts')
    .select('ui_preferences')
    .eq('user_id', user_id)
    .maybeSingle()

  if (error !== null) {
    throw new Error(`Failed to load UI preferences: ${error.message}`)
  }

  if (data === null) {
    return {}
  }

  const raw = (data as { ui_preferences: unknown }).ui_preferences

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return {}
  }

  const record: UiPreferencesRecord = {}

  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string') {
      record[key] = value
    }
  }

  return record
}
