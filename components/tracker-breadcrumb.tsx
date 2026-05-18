import Link from 'next/link'

export interface TrackerBreadcrumbSegment {
  label: string
  href?: string
}

interface TrackerBreadcrumbProps {
  current: string
  parent?: TrackerBreadcrumbSegment
}

/**
 * Breadcrumb trail from the tracker home to a sub-page.
 */
export function TrackerBreadcrumb({ current, parent }: TrackerBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="min-w-0 text-left">
      <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-[0.85rem]">
        <li>
          <Link
            className="text-muted no-underline hover:text-foreground"
            href="/"
          >
            Tracker
          </Link>
        </li>
        {parent !== undefined ? (
          <>
            <li className="text-muted" aria-hidden="true">
              /
            </li>
            <li>
              {parent.href !== undefined ? (
                <Link
                  className="text-muted no-underline hover:text-foreground"
                  href={parent.href}
                >
                  {parent.label}
                </Link>
              ) : (
                <span className="text-muted">{parent.label}</span>
              )}
            </li>
          </>
        ) : null}
        <li className="text-muted" aria-hidden="true">
          /
        </li>
        <li className="font-medium text-foreground" aria-current="page">
          {current}
        </li>
      </ol>
    </nav>
  )
}
