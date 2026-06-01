# CellForge

![CellForge wordmark](./public/brand/cellforge-wordmark.svg)

[![CI](https://github.com/cellforge-dev/cellforge/actions/workflows/ci.yml/badge.svg)](https://github.com/cellforge-dev/cellforge/actions/workflows/ci.yml)

CellForge is an open-source loader system for React teams. It ships animated cell-based loading primitives, a live tuning studio, and a shadcn-style registry so teams can install editable source code instead of adding another runtime package.

- Website: https://cellforge.dev
- Repository: https://github.com/cellforge-dev/cellforge
- License: MIT
- Current distribution: shadcn-style source registry
- npm package: not published yet

## What You Get

- 71 installable loader items generated from the local registry.
- A gallery for browsing loader families and quick install commands.
- Studio for tuning color, shape, pattern, size, speed, padding, frames, and generated code.
- Playground for deeper prop experiments.
- Manual setup docs for teams that cannot use the shadcn CLI.
- Reduced-motion handling and CSS-only animation paths for shipped loaders.

## Install A Loader

The recommended path is the shadcn registry. Add CellForge to `components.json`:

```json
{
  "registries": {
    "@cellforge": "https://cellforge.dev/r/{name}.json"
  }
}
```

Then install a loader:

```bash
npx shadcn@latest add @cellforge/cell-square-3
```

Or install directly from the public registry URL:

```bash
npx shadcn@latest add https://cellforge.dev/r/cell-square-3.json
```

Install the complete set:

```bash
npx shadcn@latest add @cellforge/all
```

## Basic Usage

Installed loaders are local files in your app, usually under `components/ui`.

```tsx
import { CellSquare3 } from "@/components/ui/cell-square-3";

export function SaveButton({ isSaving }: { isSaving: boolean }) {
  return (
    <button type="button" disabled={isSaving} aria-busy={isSaving}>
      {isSaving ? <CellSquare3 size={18} dotSize={3} ariaLabel="Saving" /> : null}
      <span>{isSaving ? "Saving..." : "Save changes"}</span>
    </button>
  );
}
```

## Manual Setup

Use manual setup when the shadcn CLI is not available or your project has a custom folder layout. Copy these files first:

```txt
components/ui/cellforge-core.tsx
components/ui/cellforge-hooks.ts
components/cellforge-loader.css
components/ui/cell-square-3.tsx
```

Then import the CSS once from your global stylesheet if your setup does not do it automatically:

```css
@import "../components/cellforge-loader.css";
```

The full source snippets are documented at https://cellforge.dev/getting-started/manual.

## Local Development

```bash
pnpm install
pnpm dev
```

Useful checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm registry:build
pnpm smoke:consumer
pnpm build
```

Run the full local validation set:

```bash
pnpm check
```

Build registry files with production metadata:

```bash
REGISTRY_HOMEPAGE=https://cellforge.dev pnpm registry:build
```

On Windows PowerShell:

```powershell
$env:REGISTRY_HOMEPAGE="https://cellforge.dev"; pnpm registry:build
```

## Project Structure

```txt
app/                  Next.js routes for the site, docs, studio, and playground
components/           Site UI and shared editor/gallery controls
loaders/              Source loader primitives and tests
lib/                  Registry metadata, source transforms, and helpers
public/r/             Generated shadcn registry files
public/brand/         Logo and wordmark assets
scripts/              Registry build and consumer smoke checks
```

## Publishing Model

CellForge currently publishes source through `https://cellforge.dev/r/*`. That is enough for shadcn installs.

An npm package can be added later if the project needs a runtime import path such as `@cellforge/react`. Until then, `package.json` intentionally remains `private: true` to prevent accidental npm publishing.

## Repository Health

- CI validates lint, typecheck, tests, registry generation, consumer smoke checks, and production build.
- Issues are enabled for bugs and feature requests.
- Security policy is documented in `SECURITY.md`.
- Release checklist is documented in `docs/release-checklist.md`.

## License

MIT. See [LICENSE](./LICENSE).
