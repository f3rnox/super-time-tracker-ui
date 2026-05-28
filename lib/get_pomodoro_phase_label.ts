/**
 * Maps a pomodoro timer phase to a short display label.
 */
export function get_pomodoro_phase_label(
  phase: "work" | "short_break" | "long_break",
): string {
  if (phase === "work") {
    return "Focus";
  }

  if (phase === "short_break") {
    return "Short break";
  }

  return "Long break";
}
