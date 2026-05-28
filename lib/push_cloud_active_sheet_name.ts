/**
 * Updates the active sheet name in Supabase without a full database push.
 */
export async function push_cloud_active_sheet_name(
  sheet_name: string,
): Promise<void> {
  const response = await fetch("/api/sheet/active", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: sheet_name }),
  });

  if (!response.ok) {
    const body = (await response.json()) as { error?: string };
    throw new Error(body.error ?? "Failed to update active sheet in cloud");
  }
}
