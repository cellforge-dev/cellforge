import Link from "next/link";

import { ManualCodePanel } from "@/components/manual-code-panel";
import { getManualSetupSources } from "@/lib/source";

const cssImportLine = `@import "../components/cellforge-loader.css";`;

const exampleInstallOrder = `components/ui/cellforge-core.tsx
components/ui/cellforge-hooks.ts
components/cellforge-loader.css
components/ui/cell-square-3.tsx`;

export default async function ManualGettingStartedPage() {
  const manualSetup = await getManualSetupSources();

  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="theme-page-shell grid gap-8 rounded-2xl border border-border-soft px-0 py-10 sm:p-6">
        <header className="grid gap-3">
          <p className="theme-text-muted text-xs uppercase tracking-[0.22em]">Manual path</p>
          <h1 className="theme-text-strong max-w-3xl text-3xl tracking-tight sm:text-4xl">
            Copy the shared runtime once, then paste loader source.
          </h1>
          <p className="theme-text max-w-[74ch] text-sm leading-relaxed">
            Manual setup is intentionally separate from Usage. Use it when the shadcn registry is not available
            or when you need full control over where the runtime files live.
          </p>
        </header>

        <section className="grid gap-3 rounded-xl border border-border-soft bg-surface/55 p-4 sm:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 className="theme-text-strong text-base tracking-tight">Recommended order</h2>
            <p className="theme-text-muted mt-2 text-sm leading-relaxed">
              Add the runtime files first. Individual loader files can then import from the local runtime.
            </p>
          </div>
          <ManualCodePanel title="File order" code={exampleInstallOrder} lang="bash" />
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">1. Add the shared core</h2>
          <p className="theme-text max-w-[72ch] text-sm leading-relaxed">
            This file contains the base renderer, path helpers, patterns, and shared prop types used by the loaders.
          </p>
          <ManualCodePanel
            title={manualSetup.coreFilePath}
            code={manualSetup.coreSource}
            lang="tsx"
            scrollClassName="min-h-[48dvh] max-h-[64dvh] overflow-x-auto"
          />
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">2. Add the hooks</h2>
          <p className="theme-text max-w-[72ch] text-sm leading-relaxed">
            Hooks keep animation timing, reduced motion, and stepped cycles consistent across copied loaders.
          </p>
          <ManualCodePanel
            title={manualSetup.hooksFilePath}
            code={manualSetup.hooksSource}
            lang="typescript"
            scrollClassName="min-h-[38dvh] max-h-[58dvh] overflow-x-auto"
          />
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">3. Add the CSS</h2>
          <p className="theme-text max-w-[72ch] text-sm leading-relaxed">
            The CSS file defines animation keyframes, masks, and shape classes. Import it once from your global CSS.
          </p>
          <ManualCodePanel
            title={manualSetup.cssFilePath}
            code={manualSetup.cssSource}
            lang="css"
            scrollClassName="min-h-[48dvh] max-h-[64dvh] overflow-x-auto"
          />
          <ManualCodePanel
            title="Import in globals.css"
            code={cssImportLine}
            lang="css"
            scrollClassName="overflow-x-auto"
          />
        </section>

        <section className="grid gap-3 rounded-xl border border-border-soft bg-surface/55 p-4">
          <h2 className="theme-text-strong text-lg tracking-tight">Next step</h2>
          <p className="theme-text max-w-[72ch] text-sm leading-relaxed">
            After these files exist, copy any individual loader source from the gallery or use Studio to generate the
            final props. If you can use the CLI, the registry path is faster and less error-prone.
          </p>
          <Link href="/getting-started/usage" className="theme-link inline-flex text-sm underline underline-offset-4">
            Compare with registry usage
          </Link>
          <a
            href="https://www.npmjs.com/package/cellforge-loaders"
            target="_blank"
            rel="noreferrer"
            className="theme-link inline-flex text-sm underline underline-offset-4"
          >
            Open npm package
          </a>
        </section>
      </section>
    </main>
  );
}
