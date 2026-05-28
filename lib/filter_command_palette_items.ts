import { type CommandPaletteItem } from "@/lib/types/command_palette";

/**
 * Filters command palette items by a case-insensitive query.
 */
export function filter_command_palette_items(
  items: CommandPaletteItem[],
  query: string,
): CommandPaletteItem[] {
  const normalized_query = query.trim().toLowerCase();

  if (normalized_query.length === 0) {
    return items;
  }

  return items.filter((item) => {
    const haystack = [item.title, item.subtitle ?? "", ...item.keywords]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized_query);
  });
}
