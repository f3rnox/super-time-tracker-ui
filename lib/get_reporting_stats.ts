import { build_reporting_stats } from '@/lib/build_reporting_stats'
import { read_db } from '@/lib/read_db'
import { serialize_reporting_source_sheets } from '@/lib/serialize_reporting_source_sheets'
import {
  type ReportingSourceSheet,
  type ReportingStats,
} from '@/lib/types/reporting'

export interface ReportingPageData {
  sourceSheets: ReportingSourceSheet[]
  stats: ReportingStats
}

/**
 * Loads reporting source data and the default all-time snapshot.
 */
export async function get_reporting_stats(): Promise<ReportingPageData> {
  const db = await read_db()
  const source_sheets = serialize_reporting_source_sheets(db.sheets)

  return {
    sourceSheets: source_sheets,
    stats: build_reporting_stats(db.sheets),
  }
}
