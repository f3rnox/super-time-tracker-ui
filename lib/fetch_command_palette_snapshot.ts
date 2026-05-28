import { type CommandPaletteSnapshot } from "@/lib/types/command_palette";

/**
 * Loads command palette data from the API.
 */
export async function fetch_command_palette_snapshot(
  query: string,
): Promise<CommandPaletteSnapshot> {
  const params = new URLSearchParams();

  if (query.trim().length > 0) {
    params.set("q", query.trim());
  }

  const suffix = params.size > 0 ? `?${params.toString()}` : "";
  const response = await fetch(`/api/command-palette${suffix}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(body.error ?? "Failed to load command palette data");
  }

  return (await response.json()) as CommandPaletteSnapshot;
}
