import { TrackerApp } from '@/components/tracker-app'
import { get_tracker_state } from '@/lib/get_tracker_state'

export default async function Home() {
  const initial_state = await get_tracker_state()

  return <TrackerApp initial_state={initial_state} />
}
