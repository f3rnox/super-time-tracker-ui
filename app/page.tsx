import { cookies } from 'next/headers'

import { TrackerApp } from '@/components/tracker-app'
import { get_initial_preferred_sheet_name } from '@/lib/get_initial_preferred_sheet_name'
import { get_tracker_state } from '@/lib/get_tracker_state'
import { read_db } from '@/lib/read_db'
import {
  ACTIVE_SHEET_COOKIE_NAME,
  DEFAULT_SHEET_FIXED_NAME_COOKIE_NAME,
  DEFAULT_SHEET_SESSION_MODE_COOKIE_NAME,
} from '@/lib/types/ui_settings'

export default async function Home() {
  const cookie_store = await cookies()

  const db = await read_db()
  const preferred_sheet = get_initial_preferred_sheet_name(db, {
    session_mode: cookie_store.get(DEFAULT_SHEET_SESSION_MODE_COOKIE_NAME)?.value,
    fixed_sheet_name: cookie_store.get(DEFAULT_SHEET_FIXED_NAME_COOKIE_NAME)?.value,
    last_viewed_sheet: cookie_store.get(ACTIVE_SHEET_COOKIE_NAME)?.value,
  })
  const initial_state = await get_tracker_state(preferred_sheet)

  return <TrackerApp initial_state={initial_state} />
}
