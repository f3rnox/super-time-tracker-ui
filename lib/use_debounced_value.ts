"use client";

import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of a value after the delay elapses.
 */
export function use_debounced_value<T>(value: T, delay_ms: number): T {
  const [debounced_value, setDebounced_value] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebounced_value(value);
    }, delay_ms);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [value, delay_ms]);

  return debounced_value;
}
