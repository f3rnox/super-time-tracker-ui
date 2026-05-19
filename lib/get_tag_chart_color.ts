const TAG_PALETTE: readonly string[] = [
  "#2dd4bf",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#fb923c",
  "#facc15",
  "#34d399",
  "#22d3ee",
  "#f87171",
  "#c084fc",
  "#fbbf24",
  "#4ade80",
];

const UNTAGGED_COLOR = "#64748b";

/**
 * Returns a stable palette colour for a tag based on its position in the breakdown.
 */
export function get_tag_chart_color(tag: string, index: number): string {
  if (tag === "Untagged") {
    return UNTAGGED_COLOR;
  }

  return TAG_PALETTE[index % TAG_PALETTE.length];
}
