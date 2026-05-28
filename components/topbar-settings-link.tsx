"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SettingsIcon } from "@/components/settings-icon";

/**
 * Topbar link to settings rendered as a cog icon button.
 */
export function TopbarSettingsLink(): React.ReactElement {
  const pathname = usePathname() ?? "/";
  const is_active = pathname.startsWith("/settings");

  return (
    <Link
      href="/settings"
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-panel-border bg-ghost-bg text-muted no-underline hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent${
        is_active ? " border-accent-border text-foreground" : ""
      }`}
      aria-label="Settings"
      aria-current={is_active ? "page" : undefined}
    >
      <SettingsIcon />
    </Link>
  );
}
