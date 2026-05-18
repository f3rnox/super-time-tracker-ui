import { ReportingView } from '@/components/reporting-view'
import { get_reporting_stats } from '@/lib/get_reporting_stats'

/**
 * Per-sheet time-tracking reporting route.
 */
export default async function ReportingPage() {
  const { sourceSheets } = await get_reporting_stats()

  return <ReportingView source_sheets={sourceSheets} />
}
