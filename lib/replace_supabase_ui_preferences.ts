import { create_server_supabase_client } from '@/lib/create_server_supabase_client'
import { type UiPreferencesRecord } from '@/lib/collect_ui_preferences_from_window'

/**
 * Replaces the full UI preferences record for the signed-in user in Supabase.
 */
export async function replace_supabase_ui_preferences(
  user_id: string,
  preferences: UiPreferencesRecord,
): Promise<void> {
  const supabase = await create_server_supabase_client()

  const { error } = await supabase
    .from('tracker_accounts')
    .update({ ui_preferences: preferences })
    .eq('user_id', user_id)

  if (error !== null) {
    throw new Error(`Failed to save UI preferences: ${error.message}`)
  }
}
