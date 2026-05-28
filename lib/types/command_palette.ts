import { type ReportingDateRangeShortcut } from '@/lib/types/reporting'

export type CommandPaletteItemKind =
  | 'navigate'
  | 'sheet'
  | 'template_check_in'
  | 'resume_entry'
  | 'resume_last'
  | 'reporting_range'

export interface CommandPaletteItem {
  id: string
  kind: CommandPaletteItemKind
  group: string
  title: string
  subtitle?: string
  keywords: string[]
  href?: string
  sheetName?: string
  description?: string
  entryId?: number
  tags?: string[]
  reportingRange?: ReportingDateRangeShortcut
}

export interface CommandPaletteEntrySnapshot {
  id: number
  sheetName: string
  description: string
  tags: string[]
  end: string
}

export interface CommandPaletteSnapshot {
  activeSheetName: string | null
  sheets: { name: string; hasActiveEntry: boolean }[]
  lastCompletedEntry: CommandPaletteEntrySnapshot | null
  matchingEntries: CommandPaletteEntrySnapshot[]
}
