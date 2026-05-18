import { type TrackerState } from "@/lib/types/tracker_state";

/**
 * Loads tracker state from the API.
 */
export async function fetch_tracker_state(): Promise<TrackerState> {
  const response = await fetch("/api/state", { cache: "no-store" });

  if (!response.ok) {
    const body = (await response.json()) as { error?: string };
    throw new Error(body.error ?? "Failed to load tracker state");
  }

  return (await response.json()) as TrackerState;
}
