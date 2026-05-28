/**
 * Returns a shallow copy of a record without the given key when present.
 */
export function omit_record_key<T extends Record<string, unknown>>(
  record: T,
  key: string,
): T {
  if (!(key in record)) {
    return record;
  }

  const next = { ...record };
  delete next[key];
  return next;
}
