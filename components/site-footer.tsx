import { DotMatrixIcon } from "@/loaders";
import { ReducedMotionOverrideProvider } from "@/loaders/hooks/use-prefers-reduced-motion";

export function SiteFooter() {
  const links = [
    { label: "GitHub", href: "https://github.com/cellforge-dev/cellforge" },
    { label: "npm", href: "https://www.npmjs.com/package/cellforge-loaders" }
  ] as const;

  return (
    <footer role="contentinfo" className="mx-auto mt-20 w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-t border-border-soft pt-6 text-sm text-fg-dim sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg border border-border-soft bg-surface/70">
            <ReducedMotionOverrideProvider reducedMotion={false}>
              <DotMatrixIcon size={22} dotSize={2.4} animated />
            </ReducedMotionOverrideProvider>
          </span>
          <div>
            <p className="font-semibold tracking-tight text-fg-strong">CellForge</p>
            <p className="text-xs text-fg-dim">Loader primitives and tuning tools for interface motion.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="theme-link underline-offset-4 hover:underline"
            >
              {link.label}
            </a>
          ))}
          <span className="uppercase tracking-[0.2em] text-fg-dim">MIT / v0.1.0</span>
        </div>
      </div>
    </footer>
  );
}
