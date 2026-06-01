import { readFile } from "node:fs/promises";
import path from "node:path";

const loadersRoot = path.join(process.cwd(), "loaders");
const manualRoot = path.join(loadersRoot, "manual");

export interface ManualSetupSources {
  coreFilePath: string;
  coreSource: string;
  hooksFilePath: string;
  hooksSource: string;
  cssFilePath: string;
  cssSource: string;
}

const importRewrites: ReadonlyArray<{ from: string; to: string }> = [
  { from: "../base/dot-matrix-base", to: "./cellforge-core" },
  { from: "../core/circle-mask", to: "./cellforge-core" },
  { from: "../core/cx", to: "./cellforge-core" },
  { from: "../core/grid-paths", to: "./cellforge-core" },
  { from: "../core/hydration-inline-style", to: "./cellforge-core" },
  { from: "../core/opacity-triplet", to: "./cellforge-core" },
  { from: "../core/path-wave-factory", to: "./cellforge-core" },
  { from: "../core/patterns", to: "./cellforge-core" },
  { from: "../types", to: "./cellforge-core" },
  { from: "../hooks/use-cycle-phase", to: "./cellforge-hooks" },
  { from: "../hooks/use-stepped-cycle", to: "./cellforge-hooks" },
  { from: "../hooks/use-prefers-reduced-motion", to: "./cellforge-hooks" },
  { from: "../core/phases", to: "./cellforge-hooks" }
];

function brandSource(source: string): string {
  return source
    .replaceAll("DotMatrix", "CellForge")
    .replaceAll("dotmatrix-core", "cellforge-core")
    .replaceAll("dotmatrix-hooks", "cellforge-hooks")
    .replaceAll("dotmatrix-loader.css", "cellforge-loader.css")
    .replaceAll("Dotm", "Cell");
}

export async function getLoaderSource(fileName: string): Promise<string> {
  const source = await readFile(path.join(loadersRoot, "loaders", fileName), "utf-8");
  const rewritten = importRewrites.reduce((current, { from, to }) => {
    return current.replaceAll(`"${from}"`, `"${to}"`);
  }, source);
  return brandSource(rewritten);
}

export async function getManualSetupSources(): Promise<ManualSetupSources> {
  const [coreSource, hooksSource, cssSource] = await Promise.all([
    readFile(path.join(manualRoot, "dotmatrix-core.tsx"), "utf-8"),
    readFile(path.join(manualRoot, "dotmatrix-hooks.ts"), "utf-8"),
    readFile(path.join(loadersRoot, "styles.css"), "utf-8")
  ]);

  return {
    coreFilePath: "components/ui/cellforge-core.tsx",
    coreSource: brandSource(coreSource.replaceAll("@/components/dotmatrix-loader.css", "@/components/cellforge-loader.css")),
    hooksFilePath: "components/ui/cellforge-hooks.ts",
    hooksSource: brandSource(hooksSource),
    cssFilePath: "components/cellforge-loader.css",
    cssSource: brandSource(cssSource)
  };
}

export async function getSharedCssSource(): Promise<string> {
  return readFile(path.join(loadersRoot, "styles.css"), "utf-8");
}
