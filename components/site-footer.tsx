import { DotMatrixIcon } from "@/loaders";
import { ReducedMotionOverrideProvider } from "@/loaders/hooks/use-prefers-reduced-motion";

export function SiteFooter() {
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
        <p className="text-xs uppercase tracking-[0.2em] text-fg-dim">MIT / v0.1.0</p>
      </div>
    </footer>
  );
}
