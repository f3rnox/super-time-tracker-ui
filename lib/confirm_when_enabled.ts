/**
 * Runs a confirm callback when enabled; otherwise resolves true.
 */
export async function confirm_when_enabled(
  enabled: boolean,
  confirm: () => Promise<boolean>,
): Promise<boolean> {
  if (enabled) {
    return confirm();
  }

  return true;
}
