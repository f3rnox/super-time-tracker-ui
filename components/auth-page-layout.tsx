import { type ReactNode } from "react";

import {
  TrackerTopbar,
  type TrackerTopbarBreadcrumb,
} from "@/components/tracker-topbar";

type AuthPageLayoutProps = Readonly<{
  breadcrumb: TrackerTopbarBreadcrumb;
  title: string;
  description: string;
  children: ReactNode;
}>;

/**
 * Shared chrome for sign-in and register pages.
 */
export function AuthPageLayout({
  breadcrumb,
  title,
  description,
  children,
}: AuthPageLayoutProps): React.ReactElement {
  return (
    <>
      <TrackerTopbar breadcrumb={breadcrumb} />
      <main className="mx-auto w-full max-w-[1120px] px-5 pb-10 pt-6">
        <section className="flex min-w-0 flex-col gap-4">
          <header className="flex flex-col gap-1">
            <h1 className="m-0 text-[1.35rem] font-[650] tracking-tight">
              {title}
            </h1>
            <p className="m-0 text-[0.9rem] leading-relaxed text-muted">
              {description}
            </p>
          </header>
          <div className="mx-auto w-full max-w-md rounded-md border border-panel-border bg-panel p-5 shadow-sm">
            {children}
          </div>
        </section>
      </main>
    </>
  );
}
