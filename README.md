# CellForge

CellForge is a free, open-source loader library and studio for branded loading states.

Website: https://cellforge.dev
Repository: https://github.com/cellforge-dev/cellforge

## Local development

```bash
pnpm install
pnpm dev
```

## Registry

CellForge is designed as a shadcn-style source registry. Once the site is deployed,
loaders can be installed into a consumer app from the public registry endpoint:

```bash
npx shadcn@latest add https://cellforge.dev/r/cell-square-3.json
```

Set `REGISTRY_HOMEPAGE` when building to override registry homepage metadata.
The default production homepage is `https://cellforge.dev`.

## Studio

The Studio route lets you select a loader, theme it, adjust cell size, padding,
speed, shape, pattern, and export generated code for multiple targets.
