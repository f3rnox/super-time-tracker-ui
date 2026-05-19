/**
 * Rounds a percentage for chart style attributes so SSR and client match.
 */
export function round_chart_percent(percent: number): number {
  return Math.round(percent * 100) / 100
}
