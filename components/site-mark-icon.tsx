export type SiteMarkIconProps = {
  className?: string;
};

/** CellForge mark: a segmented loader frame with four luminous cells. */
export function SiteMarkIcon({ className }: SiteMarkIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect width="64" height="64" rx="12" fill="var(--color-background)" />
      <path
        d="M15 22V14l8-8h11M49 22V14l-8-8H30M15 42v8l8 8h11M49 42v8l-8 8H30"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M22 21h10l3 3h7l4 4v8l-4 4h-7l-3 3H22l-4-4V25l4-4Z"
        fill="var(--color-surface-raised)"
        stroke="var(--color-fg-dim)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <rect x="22" y="22" width="10" height="10" rx="2.5" fill="var(--color-dot-on)" />
      <rect x="34" y="22" width="10" height="10" rx="2.5" fill="var(--color-dot-on)" />
      <rect x="22" y="34" width="10" height="10" rx="2.5" fill="var(--color-dot-on)" />
      <rect x="34" y="34" width="10" height="10" rx="2.5" fill="var(--color-dot-on)" />
      <path
        d="M29 14v5M32 14v5M35 14v5M29 45v5M32 45v5M35 45v5M14 29h5M14 32h5M14 35h5M45 29h5M45 32h5M45 35h5"
        stroke="var(--color-fg-muted)"
        strokeWidth="1.8"
        strokeLinecap="square"
      />
    </svg>
  );
}
