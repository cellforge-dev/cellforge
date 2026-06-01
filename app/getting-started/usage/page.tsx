import Link from "next/link";

import { ManualCodePanel } from "@/components/manual-code-panel";

const initCommand = `npx shadcn@latest init`;

const componentsJsonExample = `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "tailwind": {
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {
    "@cellforge": "https://cellforge.dev/r/{name}.json"
  }
}`;

const installCommand = `npx shadcn@latest add @cellforge/cell-square-3`;
const installAllCommand = `npx shadcn@latest add @cellforge/all`;
const npmInstallCommand = `npm install cellforge-loaders`;

const globalsCssImportExample = `@import "../components/cellforge-loader.css";`;
const npmCssImportExample = `import "cellforge-loaders/styles.css";`;

const usageExample = `import { CellSquare3 } from "@/components/ui/cell-square-3";

export function SaveButton({ isSaving }: { isSaving: boolean }) {
  return (
    <button
      type="button"
      disabled={isSaving}
      aria-busy={isSaving}
      className="inline-flex items-center gap-2 rounded-md border px-3 py-2"
    >
      {isSaving ? <CellSquare3 size={18} dotSize={3} aria-label="Saving" /> : null}
      <span>{isSaving ? "Saving..." : "Save changes"}</span>
    </button>
  );
}`;

const npmUsageExample = `import "cellforge-loaders/styles.css";
import { CellSquare3 } from "cellforge-loaders";

export function SaveButton({ isSaving }: { isSaving: boolean }) {
  return (
    <button type="button" disabled={isSaving} aria-busy={isSaving}>
      {isSaving ? <CellSquare3 size={18} dotSize={3} ariaLabel="Saving" /> : null}
      <span>{isSaving ? "Saving..." : "Save changes"}</span>
    </button>
  );
}`;

export default function UsagePage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="theme-page-shell grid gap-8 rounded-2xl border border-border-soft px-0 py-10 sm:p-6">
        <header className="grid gap-3">
          <p className="theme-text-muted text-xs uppercase tracking-[0.22em]">Registry path</p>
          <h1 className="theme-text-strong max-w-3xl text-3xl tracking-tight sm:text-4xl">
            Install loaders through the shadcn registry or npm.
          </h1>
          <p className="theme-text max-w-[74ch] text-sm leading-relaxed">
            Use this path when your app already uses shadcn or can add a `components.json`.
            The CLI pulls editable source into your project, so the installed loader is local code,
            not a runtime package dependency. If you prefer a regular dependency, use `cellforge-loaders`.
          </p>
        </header>

        <section className="grid gap-3 rounded-xl border border-border-soft bg-surface/55 p-4 sm:grid-cols-2">
          <div>
            <h2 className="theme-text-strong text-base tracking-tight">Use Usage when</h2>
            <ul className="theme-text-muted mt-3 grid gap-2 text-sm leading-relaxed">
              <li>- You want the fastest install flow.</li>
              <li>- Your app already has Tailwind and shadcn conventions.</li>
              <li>- You want individual loaders or the full registry bundle.</li>
            </ul>
          </div>
          <div>
            <h2 className="theme-text-strong text-base tracking-tight">Use Manual setup when</h2>
            <ul className="theme-text-muted mt-3 grid gap-2 text-sm leading-relaxed">
              <li>- You cannot use the shadcn CLI.</li>
              <li>- You want to paste source files by hand.</li>
              <li>- You are adapting CellForge to a non-standard folder layout.</li>
            </ul>
            <Link href="/getting-started/manual" className="theme-link mt-3 inline-flex text-sm underline underline-offset-4">
              Open manual setup
            </Link>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">1. Prepare shadcn</h2>
          <p className="theme-text max-w-[72ch] text-sm leading-relaxed">
            If `components.json` is missing, initialize shadcn first. Existing projects can skip this step.
          </p>
          <ManualCodePanel title="Initialize shadcn" code={initCommand} lang="bash" />
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">2. Register CellForge</h2>
          <p className="theme-text max-w-[72ch] text-sm leading-relaxed">
            Add the `@cellforge` registry entry once. The CLI can then resolve items like
            `@cellforge/cell-square-3`.
          </p>
          <ManualCodePanel
            title="components.json"
            code={componentsJsonExample}
            lang="json"
            scrollClassName="min-h-[38dvh] max-h-[58dvh] overflow-x-auto"
          />
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">3. Install loaders</h2>
          <p className="theme-text text-sm leading-relaxed">Install one loader:</p>
          <ManualCodePanel title="Install loader" code={installCommand} lang="bash" />
          <p className="theme-text text-sm leading-relaxed">Or install the complete set:</p>
          <ManualCodePanel title="Install all loaders" code={installAllCommand} lang="bash" />
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">4. Confirm styles</h2>
          <p className="theme-text max-w-[72ch] text-sm leading-relaxed">
            Registry items include the shared CSS file. If your setup does not import it automatically,
            add the generated CSS import to your global stylesheet.
          </p>
          <ManualCodePanel title="globals.css" code={globalsCssImportExample} lang="css" />
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">5. Use loaders in real UI states</h2>
          <p className="theme-text max-w-[72ch] text-sm leading-relaxed">
            Keep the loader close to the pending action and pair it with text when the action is not obvious.
          </p>
          <ManualCodePanel
            title="Save button example"
            code={usageExample}
            lang="tsx"
            scrollClassName="min-h-[36dvh] max-h-[58dvh] overflow-x-auto"
          />
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">npm alternative</h2>
          <p className="theme-text max-w-[72ch] text-sm leading-relaxed">
            Use the npm package when you want a normal React dependency instead of copied source files.
            Import the package CSS once, then import loaders from `cellforge-loaders`.
          </p>
          <a
            href="https://www.npmjs.com/package/cellforge-loaders"
            target="_blank"
            rel="noreferrer"
            className="theme-link inline-flex text-sm underline underline-offset-4"
          >
            Open npm package
          </a>
          <ManualCodePanel title="Install package" code={npmInstallCommand} lang="bash" />
          <ManualCodePanel title="Import CSS once" code={npmCssImportExample} lang="tsx" />
          <ManualCodePanel
            title="Runtime package example"
            code={npmUsageExample}
            lang="tsx"
            scrollClassName="min-h-[36dvh] max-h-[58dvh] overflow-x-auto"
          />
        </section>
      </section>
    </main>
  );
}
