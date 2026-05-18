import { TagManagementView } from '@/components/tag-management-view'
import { collect_tag_stats } from '@/lib/collect_tag_stats'
import { read_db } from '@/lib/read_db'

/**
 * Tag rename and merge management route.
 */
export default async function TagManagementPage() {
  const db = await read_db()
  const initial_tags = collect_tag_stats(db)

  return <TagManagementView initial_tags={initial_tags} />
}
