"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CommandPalette } from "@/components/command-palette";
import { build_command_palette_items } from "@/lib/build_command_palette_items";
import { build_entry_search_href } from "@/lib/build_entry_search_href";
import { get_empty_entry_search_filters } from "@/lib/parse_entry_search_filters";
import { execute_command_palette_item } from "@/lib/execute_command_palette_item";
import { fetch_command_palette_snapshot } from "@/lib/fetch_command_palette_snapshot";
import { filter_command_palette_items } from "@/lib/filter_command_palette_items";
import {
  type CommandPaletteItem,
  type CommandPaletteSnapshot,
} from "@/lib/types/command_palette";
import { use_command_palette_hotkey } from "@/lib/use_command_palette_hotkey";
import { message_from_unknown_error } from "@/lib/message_from_unknown_error";
import { use_debounced_value } from "@/lib/use_debounced_value";

const empty_snapshot: CommandPaletteSnapshot = {
  activeSheetName: null,
  sheets: [],
  lastCompletedEntry: null,
  matchingEntries: [],
};

/**
 * Global command palette provider (Ctrl+P).
 */
export function CommandPaletteProvider() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debounced_query = use_debounced_value(query, 200);
  const [snapshot, setSnapshot] =
    useState<CommandPaletteSnapshot>(empty_snapshot);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle_palette = useCallback(() => {
    setIsOpen((open) => {
      if (open) {
        setQuery("");
      }

      return !open;
    });
  }, []);

  use_command_palette_hotkey(toggle_palette);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;

    const load_snapshot = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const next_snapshot =
          await fetch_command_palette_snapshot(debounced_query);

        if (!cancelled) {
          setSnapshot(next_snapshot);
        }
      } catch (load_error: unknown) {
        if (!cancelled) {
          setError(
            message_from_unknown_error(load_error, "Failed to load commands"),
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load_snapshot();

    return () => {
      cancelled = true;
    };
  }, [isOpen, debounced_query]);

  const items = useMemo((): CommandPaletteItem[] => {
    const built = build_command_palette_items({ snapshot });
    const filtered = filter_command_palette_items(built, query);
    const trimmed_query = query.trim();

    if (trimmed_query.length === 0) {
      return filtered;
    }

    const search_all_item: CommandPaletteItem = {
      id: "search-all-entries",
      kind: "navigate",
      group: "Search",
      title: `Search all entries for "${trimmed_query}"`,
      subtitle: "Open search with filters",
      keywords: ["search", trimmed_query],
      href: build_entry_search_href({
        ...get_empty_entry_search_filters(),
        query: trimmed_query,
      }),
    };

    return [search_all_item, ...filtered];
  }, [snapshot, query]);

  const handle_select = useCallback(
    async (item: CommandPaletteItem) => {
      setIsOpen(false);
      setQuery("");

      try {
        await execute_command_palette_item({
          item,
          pathname,
          navigate: (href) => {
            router.push(href);
          },
        });
      } catch {
        // Errors are surfaced via in-app notifications.
      }
    },
    [pathname, router],
  );

  const handle_close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  if (isOpen) {
    return (
      <CommandPalette
        items={items}
        query={query}
        is_loading={isLoading}
        error={error}
        on_query_change={setQuery}
        on_select={(item) => {
          void handle_select(item);
        }}
        on_close={handle_close}
      />
    );
  }

  return null;
}
