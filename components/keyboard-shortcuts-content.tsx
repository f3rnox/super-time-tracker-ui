import { type KeyboardShortcutSection } from '@/lib/types/keyboard_shortcut'

interface KeyboardShortcutsContentProps {
  sections: KeyboardShortcutSection[]
  compact?: boolean
}

interface KeyboardShortcutRowProps {
  label: string
  description: string
  compact: boolean
}

/**
 * Renders a single shortcut row inside a definition list.
 */
function KeyboardShortcutRow({
  label,
  description,
  compact,
}: KeyboardShortcutRowProps) {
  return (
    <div className="contents">
      <dt className="m-0">
        <kbd
          className={`inline-block min-w-7 rounded border border-panel-border bg-surface text-center font-mono font-semibold text-foreground ${
            compact
              ? 'px-1 py-0.5 text-[0.7rem]'
              : 'px-1.5 py-0.5 text-[0.78rem]'
          }`}
        >
          {label}
        </kbd>
      </dt>
      <dd
        className={`m-0 self-center leading-snug text-muted ${
          compact ? 'text-[0.8rem]' : 'text-[0.9rem]'
        }`}
      >
        {description}
      </dd>
    </div>
  )
}

/**
 * Renders keyboard shortcut sections as a definition list.
 */
export function KeyboardShortcutsContent({
  sections,
  compact = false,
}: KeyboardShortcutsContentProps) {
  return (
    <div className={`flex flex-col ${compact ? 'gap-2.5' : 'gap-4'}`}>
      {sections.map((section) => (
        <section key={section.title}>
          <h3
            className={`m-0 font-semibold uppercase tracking-[0.04em] text-muted ${
              compact ? 'text-[0.65rem]' : 'text-[0.72rem]'
            }`}
          >
            {section.title}
          </h3>
          <dl
            className={`m-0 grid grid-cols-[auto_minmax(0,1fr)] ${
              compact ? 'mt-1.5 gap-x-3 gap-y-1.5' : 'mt-2 gap-x-4 gap-y-2'
            }`}
          >
            {section.entries.map((entry) => (
              <KeyboardShortcutRow
                key={`${section.title}-${entry.label}-${entry.description}`}
                label={entry.label}
                description={entry.description}
                compact={compact}
              />
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
