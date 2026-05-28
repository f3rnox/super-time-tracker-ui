/**
 * Rounds an SVG coordinate for stable path strings across SSR and hydration.
 */
export function round_svg_coord(value: number): number {
  return Math.round(value * 100) / 100;
}
