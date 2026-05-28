/**
 * Returns banner surface classes for a focus nudge tone.
 */
export function get_focus_nudge_alert_class(
  tone: "warning" | "success" | "info",
): string {
  if (tone === "warning") {
    return "mb-4 rounded-md border border-danger-border bg-danger-soft px-3 py-2.5 text-danger-text";
  }

  if (tone === "success") {
    return "mb-4 rounded-md border border-accent-border bg-accent-soft px-3 py-2.5 text-accent";
  }

  return "mb-4 rounded-md border border-panel-border bg-panel px-3 py-2.5 text-foreground";
}
