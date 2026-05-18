import { promises as fs } from "node:fs";

/**
 * Ensures a directory exists, creating it recursively when missing.
 */
export async function ensure_dir_exists(dir_path: string): Promise<void> {
  try {
    await fs.mkdir(dir_path, { recursive: true });
  } catch (err: unknown) {
    const code =
      err !== null &&
      typeof err === "object" &&
      "code" in err &&
      typeof err.code === "string"
        ? err.code
        : null;

    if (code !== "EEXIST") {
      throw err;
    }
  }
}
