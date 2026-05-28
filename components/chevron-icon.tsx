type ChevronIconProps = Readonly<{
  rotated?: boolean;
  className?: string;
}>;

/**
 * Renders a chevron for expand/collapse controls.
 */
export function ChevronIcon({
  rotated = false,
  className = "",
}: ChevronIconProps) {
  return (
    <svg
      className={`h-3 w-3 shrink-0 transition-transform duration-150 ${rotated ? "rotate-90" : ""} ${className}`.trim()}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
