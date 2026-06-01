# CellForge Release Checklist

Use this checklist before a public site update, registry update, or future npm release.

## Always

- Confirm `README.md`, docs, and install commands match the current distribution model.
- Run `pnpm lint`.
- Run `pnpm typecheck`.
- Run `pnpm test`.
- Run `REGISTRY_HOMEPAGE=https://cellforge.dev pnpm registry:build`.
- Run `pnpm smoke:consumer`.
- Run `pnpm build`.
- Confirm `git diff --exit-code registry.json public/r` after registry generation.
- Open `https://cellforge.dev`.
- Open `https://cellforge.dev/r/cell-square-3.json`.
- Verify `/`, `/studio`, `/playground`, `/getting-started/usage`, and `/getting-started/manual`.

## Before A Registry Change

- Check that item names remain stable unless the change is intentional.
- Check generated imports in `public/r/*`.
- Check `components.json` examples in docs.
- Test one direct URL install and one scoped registry install in a clean consumer app.

## Before A Future npm Release

- Decide package name and scope.
- Remove `private: true` only when package exports are ready.
- Add an `exports` map.
- Verify ESM/CJS expectations.
- Add package-level README content.
- Run `npm publish --dry-run`.
- Publish with two-factor authentication enabled on npm.

## Manual Platform Checks

- GitHub repository description, homepage, topics, and issue templates are current.
- Vercel production deployment is ready.
- `cellforge.dev` resolves and uses Vercel nameservers.
- GitHub Actions is passing on `main`.
- If using Vercel Git integration, the Vercel project is connected to `cellforge-dev/cellforge`.
