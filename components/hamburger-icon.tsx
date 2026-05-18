/**
 * Renders a three-line menu icon without a filled background.
 */
export function HamburgerIcon() {
  return (
    <svg
      className="block h-4 w-4 text-muted"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  )
}
