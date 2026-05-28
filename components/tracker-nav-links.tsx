"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
}

const base_nav_items: NavItem[] = [
  { href: "/", label: "Tracker", match: (pathname) => pathname === "/" },
];

const link_base_class =
  "rounded-full px-3 py-1.5 text-[0.85rem] font-semibold no-underline transition-colors duration-150";

/**
 * Primary app navigation links for the top bar.
 */
export function TrackerNavLinks() {
  const pathname = usePathname() ?? "/";

  return (
    <div className="scrollbar-none flex min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap py-0.5 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-[980px]:overflow-visible">
      {base_nav_items.map((item) => {
        const is_active = item.match(pathname);

        return (
          <Link
            key={item.href}
            className={`${link_base_class} shrink-0 ${
              is_active
                ? "bg-accent-soft text-foreground"
                : "text-muted hover:bg-surface-hover hover:text-foreground"
            }`}
            href={item.href}
            aria-current={is_active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
