export type SiteMarkIconProps = {
  className?: string;
};

/** CellForge mark: an angular forge frame with four active cells. */
export function SiteMarkIcon({ className }: SiteMarkIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect width="64" height="64" rx="16" fill="var(--color-surface-raised)" />
      <path
        d="M18 12h28l6 6v28l-6 6H18l-6-6V18l6-6Z"
        fill="var(--color-background)"
        stroke="var(--color-border)"
        strokeWidth="2"
      />
      <path
        d="M22 20h20l4 4v16l-4 4H22l-4-4V24l4-4Z"
        stroke="var(--color-fg-dim)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="22" y="22" width="8" height="8" rx="2" fill="var(--color-dot-on)" />
      <rect x="34" y="22" width="8" height="8" rx="2" fill="var(--color-dot-on)" opacity="0.45" />
      <rect x="22" y="34" width="8" height="8" rx="2" fill="var(--color-dot-on)" opacity="0.45" />
      <rect x="34" y="34" width="8" height="8" rx="2" fill="var(--color-dot-on)" />
      <path
        d="M32 12v8M32 44v8M12 32h8M44 32h8"
        stroke="var(--color-fg-muted)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
