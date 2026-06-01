import Link from "next/link";

export const dynamic = "force-static";

export default function IntroductionPage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="theme-page-shell grid gap-8 rounded-2xl py-10 sm:p-6">
        <header className="grid gap-3">
          <p className="theme-text-muted text-xs">Introduction</p>
          <h1 className="theme-text-strong text-2xl tracking-tight sm:text-3xl">CellForge: loader motion that fits your brand</h1>
          <p className="theme-text max-w-[72ch] text-sm leading-relaxed">
            CellForge is a component library for branded loading states. Install from the shadcn registry or npm,
            tune a loader in Studio, then ship motion that stays lightweight and easy to maintain.
          </p>
        </header>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">What this project is</h2>
          <p className="theme-text max-w-[72ch] text-sm leading-relaxed">
            CellForge supports two install models: pull editable source through the shadcn-style registry,
            or install the runtime package from npm. Studio adds a visual layer for picking motion, shape,
            spacing, color, and framework output before you copy.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">Why it exists</h2>
          <ul className="theme-text grid gap-2 text-sm leading-relaxed">
            <li>- focused loading components instead of a full design framework</li>
            <li>- open source code you own after installation</li>
            <li>- registry distribution for source ownership and npm distribution for runtime imports</li>
            <li>- primitives that adapt to your spacing, color, and motion tokens quickly</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">How it fits your stack</h2>
          <p className="theme-text max-w-[72ch] text-sm leading-relaxed">
            The setup works best in React apps already using Tailwind CSS with a shadcn-compatible
            `components.json`. In that environment, onboarding is short: add the registry, install a
            loader, and style it to match your product.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">Studio vs Playground</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border-soft bg-surface/70 p-4">
              <h3 className="theme-text-strong text-sm tracking-tight">Studio</h3>
              <p className="theme-text-muted mt-2 text-sm leading-relaxed">
                Use Studio for final loader selection, brand tuning, preview frames, and copy-ready output.
              </p>
            </div>
            <div className="rounded-xl border border-border-soft bg-surface/70 p-4">
              <h3 className="theme-text-strong text-sm tracking-tight">Playground</h3>
              <p className="theme-text-muted mt-2 text-sm leading-relaxed">
                Use Playground for fast experiments, extreme prop ranges, and checking how motion behaves.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">Project links</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <a
              href="https://github.com/cellforge-dev/cellforge"
              target="_blank"
              rel="noreferrer"
              className="theme-link underline decoration-fg-dim underline-offset-4"
            >
              GitHub repository
            </a>
            <a
              href="https://www.npmjs.com/package/cellforge-loaders"
              target="_blank"
              rel="noreferrer"
              className="theme-link underline decoration-fg-dim underline-offset-4"
            >
              npm package
            </a>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">Start here</h2>
          <p className="theme-text max-w-[72ch] text-sm leading-relaxed">
            Jump into{" "}
            <Link href="/getting-started/usage" className="theme-link underline decoration-fg-dim underline-offset-2">
              Usage
            </Link>{" "}
            to install your first component, or review{" "}
            <Link href="/" className="theme-link underline decoration-fg-dim underline-offset-2">
              the loader gallery
            </Link>{" "}
            to preview available primitives.
          </p>
        </section>
      </section>
    </main>
  );
}
