import {
  get_input_class_name,
  type InputSize,
} from "@/lib/get_input_class_name";

const select_chevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

/**
 * Returns Tailwind classes for themed selects with an inset chevron.
 */
export function get_select_class_name(size: InputSize = "default"): string {
  const chevron_position =
    size === "compact"
      ? "bg-[position:right_0.55rem_center]"
      : "bg-[position:right_0.65rem_center]";
  const padding_end = size === "compact" ? "!pe-8" : "!pe-9";

  return `${get_input_class_name(size)} cursor-pointer appearance-none bg-size-[1rem] bg-no-repeat ${padding_end} bg-[image:${select_chevron}] ${chevron_position}`;
}
