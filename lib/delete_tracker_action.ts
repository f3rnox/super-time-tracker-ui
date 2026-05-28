import { type TrackerState } from "@/lib/types/tracker_state";

/**
 * Sends a DELETE request to a tracker API route and returns updated state.
 */
export async function delete_tracker_action(
  path: string,
  body: unknown,
): Promise<TrackerState> {
  const response = await fetch(path, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error ?? "Request failed");
  }

  return (await response.json()) as TrackerState;
}
