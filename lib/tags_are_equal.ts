import { normalize_stored_tag } from "@/lib/normalize_stored_tag";

/**
 * Returns whether two stored tags refer to the same tag name.
 */
export function tags_are_equal(left: string, right: string): boolean {
  try {
    return normalize_stored_tag(left) === normalize_stored_tag(right);
  } catch {
    return false;
  }
}
