import { build_command_palette_reporting_href } from '@/lib/build_command_palette_reporting_href'
import { format_display_tag } from '@/lib/format_display_tag'
import { read_entry_templates } from '@/lib/read_entry_templates'
import {
  type CommandPaletteEntrySnapshot,
  type CommandPaletteItem,
  type CommandPaletteSnapshot,
} from '@/lib/types/command_palette'
import { type ReportingDateRangeShortcut } from '@/lib/types/reporting'

interface BuildCommandPaletteItemsArgs {
  snapshot: CommandPaletteSnapshot
  include_templates?: boolean
}

const navigation_items: CommandPaletteItem[] = [
  {
    id: 'nav-tracker',
    kind: 'navigate',
    group: 'Pages',
    title: 'Open Tracker',
    keywords: ['home', 'tracker', 'timer'],
    href: '/',
  },
  {
    id: 'nav-today',
    kind: 'navigate',
    group: 'Pages',
    title: 'Open Today',
    keywords: ['today', 'focus', 'daily'],
    href: '/today',
  },
  {
    id: 'nav-sheets',
    kind: 'navigate',
    group: 'Pages',
    title: 'Open Sheets',
    keywords: ['sheets', 'projects', 'hub'],
    href: '/sheets',
  },
  {
    id: 'nav-reporting',
    kind: 'navigate',
    group: 'Pages',
    title: 'Open Reporting',
    keywords: ['reporting', 'stats', 'analytics'],
    href: '/reporting',
  },
  {
    id: 'nav-search',
    kind: 'navigate',
    group: 'Pages',
    title: 'Search entries',
    keywords: ['search', 'find', 'entries', 'notes', 'tags'],
    href: '/search',
  },
  {
    id: 'nav-pomodoro',
    kind: 'navigate',
    group: 'Pages',
    title: 'Open Pomodoro',
    keywords: ['pomodoro', 'focus', 'timer'],
    href: '/pomodoro',
  },
  {
    id: 'nav-settings',
    kind: 'navigate',
    group: 'Pages',
    title: 'Open Settings',
    keywords: ['settings', 'preferences'],
    href: '/settings',
  },
]

const reporting_range_items: {
  shortcut: ReportingDateRangeShortcut
  title: string
  keywords: string[]
}[] = [
  { shortcut: 'today', title: 'Reporting: Today', keywords: ['today', 'reporting'] },
  { shortcut: 'yesterday', title: 'Reporting: Yesterday', keywords: ['yesterday'] },
  { shortcut: 'week', title: 'Reporting: This week', keywords: ['week', 'reporting'] },
  { shortcut: 'month', title: 'Reporting: This month', keywords: ['month', 'reporting'] },
  {
    shortcut: 'last_month',
    title: 'Reporting: Last month',
    keywords: ['last month', 'reporting'],
  },
  { shortcut: 'year', title: 'Reporting: This year', keywords: ['year', 'reporting'] },
  {
    shortcut: 'last_year',
    title: 'Reporting: Last year',
    keywords: ['last year', 'reporting'],
  },
]

/**
 * Builds all command palette items from API data and local templates.
 */
export function build_command_palette_items({
  snapshot,
  include_templates = true,
}: BuildCommandPaletteItemsArgs): CommandPaletteItem[] {
  const items: CommandPaletteItem[] = [
    ...navigation_items,
    ...build_reporting_range_palette_items(),
  ]

  if (snapshot.lastCompletedEntry !== null) {
    items.push(build_resume_last_item(snapshot.lastCompletedEntry))
  }

  if (include_templates && typeof window !== 'undefined') {
    for (const template of read_entry_templates()) {
      items.push({
        id: `template-${template.id}`,
        kind: 'template_check_in',
        group: 'Check in with template',
        title: `Check in: ${template.name}`,
        subtitle: template.description,
        keywords: ['check in', 'template', template.name, template.description],
        description: template.description,
        sheetName: snapshot.activeSheetName ?? undefined,
      })
    }
  }

  for (const sheet of snapshot.sheets) {
    items.push({
      id: `sheet-${sheet.name}`,
      kind: 'sheet',
      group: 'Sheets',
      title: `Open sheet: ${sheet.name}`,
      subtitle: sheet.hasActiveEntry ? 'Timer running' : undefined,
      keywords: ['sheet', sheet.name, 'project'],
      sheetName: sheet.name,
    })
  }

  const seen_entry_keys = new Set<string>()

  for (const entry of snapshot.matchingEntries) {
    const key = `${entry.sheetName}:${entry.id}`

    if (seen_entry_keys.has(key)) {
      continue
    }

    seen_entry_keys.add(key)
    items.push(build_resume_entry_item(entry))
  }

  return items
}

function build_reporting_range_palette_items(): CommandPaletteItem[] {
  return reporting_range_items.map((item) => ({
    id: `reporting-${item.shortcut}`,
    kind: 'reporting_range' as const,
    group: 'Reporting ranges',
    title: item.title,
    keywords: item.keywords,
    href: build_command_palette_reporting_href(item.shortcut),
    reportingRange: item.shortcut,
  }))
}

function build_resume_last_item(
  entry: CommandPaletteEntrySnapshot,
): CommandPaletteItem {
  return {
    id: 'resume-last',
    kind: 'resume_last',
    group: 'Recent',
    title: 'Resume last entry',
    subtitle: format_entry_subtitle(entry),
    keywords: ['resume', 'last', entry.description, entry.sheetName, ...entry.tags],
    sheetName: entry.sheetName,
    entryId: entry.id,
    description: entry.description,
    tags: entry.tags,
  }
}

function build_resume_entry_item(
  entry: CommandPaletteEntrySnapshot,
): CommandPaletteItem {
  return {
    id: `resume-${entry.sheetName}-${entry.id}`,
    kind: 'resume_entry',
    group: 'Entries',
    title: `Resume: ${entry.description || 'Untitled entry'}`,
    subtitle: format_entry_subtitle(entry),
    keywords: ['resume', entry.description, entry.sheetName, ...entry.tags],
    sheetName: entry.sheetName,
    entryId: entry.id,
    description: entry.description,
    tags: entry.tags,
  }
}

function format_entry_subtitle(entry: CommandPaletteEntrySnapshot): string {
  const tag_text = entry.tags.map((tag) => format_display_tag(tag)).join(' ')

  return tag_text.length > 0
    ? `${entry.sheetName} · ${tag_text}`
    : entry.sheetName
}
