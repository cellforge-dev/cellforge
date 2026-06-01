# Contributing To CellForge

Thanks for helping improve CellForge. Keep changes focused, testable, and aligned with the existing loader and registry model.

## Development Setup

```bash
pnpm install
pnpm dev
```

Run validation before opening a pull request:

```bash
pnpm check
```

If a change touches loader registry metadata or generated registry output, rebuild the registry first:

```bash
REGISTRY_HOMEPAGE=https://cellforge.dev pnpm registry:build
```

## Pull Request Guidelines

- Keep feature, design, registry, and documentation changes in separate PRs when possible.
- Do not change public loader prop names without documenting the migration path.
- Do not edit generated files in `public/r` by hand. Update source or registry config, then run `pnpm registry:build`.
- Add or update tests when behavior changes.
- Verify shadcn install behavior with `pnpm smoke:consumer` for registry changes.

## Design Guidelines

- Preserve the source-install model: users should own editable code after install.
- Keep loaders lightweight and accessible.
- Respect reduced-motion behavior.
- Prefer existing tokens, primitives, and registry helpers over new abstractions.
