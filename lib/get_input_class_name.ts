export type InputSize = "default" | "compact";

/**
 * Returns Tailwind classes for themed text inputs and selects.
 */
export function get_input_class_name(size: InputSize = "default"): string {
  const base =
    "box-border max-w-full min-w-0 w-full rounded-[0.65rem] border border-panel-border bg-input-bg px-3 py-2.5 font-inherit text-inherit transition-[background-color,border-color] duration-200 focus:border-input-focus-border focus:outline-none";

  if (size === "compact") {
    return `${base} px-2.5 py-2`;
  }

  return base;
}
