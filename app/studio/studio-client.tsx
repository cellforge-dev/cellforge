"use client";

import { GeistMono } from "geist/font/mono";
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties, type ReactNode } from "react";

import { CheckIcon, CopyClipboardIcon } from "@/components/package-manager-install-toolbar";
import { ShikiCodeView } from "@/components/shiki-code-view";
import { loaderComponentMap } from "@/lib/loader-component-map";
import { LOADER_GALLERY_PREVIEW_PROPS } from "@/lib/loader-gallery-preview-props";
import { ReducedMotionOverrideProvider } from "@/loaders/hooks/use-prefers-reduced-motion";
import {
  DotMatrixIcon,
  type DotMatrixColorPreset,
  type DotMatrixCommonProps,
  type DotShape,
  type MatrixPattern
} from "@/loaders";

interface StudioLoaderOption {
  slug: string;
  title: string;
  description: string;
  componentName: string;
}

interface StudioClientProps {
  initialSlug?: string;
  loaders: StudioLoaderOption[];
}

type FrameMode = "canvas" | "inline" | "agent" | "surface" | "form" | "table";
type ViewMode = "single" | "compare";
type SourceMode = "preset" | "text" | "image";
type CodeTarget = "react" | "css" | "tailwind" | "vue" | "svelte" | "rn" | "swiftui" | "lottie" | "json";

interface CustomCellField {
  columns: number;
  rows: number;
  cells: boolean[];
}

const colorPresets = [
  { label: "white", value: "#ffffff" },
  { label: "cyan", value: "#19e8d2" },
  { label: "blue", value: "#6c91ff" },
  { label: "violet", value: "#a765ff" },
  { label: "pink", value: "#f25ee6" },
  { label: "rose", value: "#ff5f98" },
  { label: "coral", value: "#ff835c" },
  { label: "lime", value: "#adff3d" },
  { label: "mint", value: "#3dff91" }
] as const;

const patternOptions: Array<{ label: string; value: MatrixPattern }> = [
  { label: "Full", value: "full" },
  { label: "Diamond", value: "diamond" },
  { label: "Outline", value: "outline" },
  { label: "Cross", value: "cross" },
  { label: "Rings", value: "rings" },
  { label: "Rose", value: "rose" }
];

const dotShapeOptions: Array<{ label: string; value: DotShape }> = [
  { label: "Circle", value: "circle" },
  { label: "Square", value: "square" },
  { label: "Diamond", value: "diamond" },
  { label: "Pill", value: "pill" },
  { label: "Triangle", value: "triangle" },
  { label: "Hex", value: "hex" },
  { label: "Plus", value: "plus" },
  { label: "Star", value: "star" },
  { label: "Hearts", value: "hearts" }
];

const codeTargets: Array<{ label: string; value: CodeTarget }> = [
  { label: "React", value: "react" },
  { label: "CSS", value: "css" },
  { label: "Tailwind", value: "tailwind" },
  { label: "Vue", value: "vue" },
  { label: "Svelte", value: "svelte" },
  { label: "RN", value: "rn" },
  { label: "SwiftUI", value: "swiftui" },
  { label: "Lottie", value: "lottie" },
  { label: "JSON", value: "json" }
];

const sourceModeOptions: Array<{ label: string; value: SourceMode }> = [
  { label: "Preset", value: "preset" },
  { label: "Text", value: "text" },
  { label: "Image", value: "image" }
];

const frameModeOptions: Array<{ label: string; value: FrameMode }> = [
  { label: "Canvas", value: "canvas" },
  { label: "Button", value: "inline" },
  { label: "Agent", value: "agent" },
  { label: "Panel", value: "surface" },
  { label: "Form", value: "form" },
  { label: "Table", value: "table" }
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
}

function publicItemName(slug: string): string {
  return slug
    .replace(/^dotm-square-/, "cell-square-")
    .replace(/^dotm-circular-/, "cell-orbit-")
    .replace(/^dotm-triangle-/, "cell-angle-")
    .replace(/^dotm-hex-/, "cell-lattice-");
}

function familyLabel(slug: string): string {
  if (slug.startsWith("dotm-circular-")) return "Radial";
  if (slug.startsWith("dotm-triangle-")) return "Angular";
  if (slug.startsWith("dotm-hex-")) return "Lattice";
  return "Sequential";
}

function packageImportName(slug: string): string {
  return publicItemName(slug)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function sampleCanvasToCells(
  canvas: HTMLCanvasElement,
  columns: number,
  rows: number,
  threshold = 72
): CustomCellField {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return { columns, rows, cells: [] };
  }
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const cells = Array.from({ length: columns * rows }, (_, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x0 = Math.floor((col / columns) * canvas.width);
    const x1 = Math.max(x0 + 1, Math.floor(((col + 1) / columns) * canvas.width));
    const y0 = Math.floor((row / rows) * canvas.height);
    const y1 = Math.max(y0 + 1, Math.floor(((row + 1) / rows) * canvas.height));
    let ink = 0;
    let samples = 0;

    for (let y = y0; y < y1; y += 1) {
      for (let x = x0; x < x1; x += 1) {
        const offset = (y * canvas.width + x) * 4;
        const alpha = image.data[offset + 3] ?? 0;
        if (alpha > 16) {
          const red = image.data[offset] ?? 255;
          const green = image.data[offset + 1] ?? 255;
          const blue = image.data[offset + 2] ?? 255;
          ink += 255 - (red + green + blue) / 3;
        }
        samples += 1;
      }
    }

    return samples > 0 && ink / samples > threshold;
  });

  return { columns, rows, cells };
}

function renderTextToCells(text: string): CustomCellField {
  const columns = 84;
  const rows = 24;
  const scale = 4;
  const canvas = document.createElement("canvas");
  canvas.width = columns * scale;
  canvas.height = rows * scale;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return { columns, rows, cells: [] };
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#000";
  context.textAlign = "center";
  context.textBaseline = "middle";
  const clean = text.trim() || "CellForge";
  const fontSize = clamp(Math.floor((columns * scale) / Math.max(clean.length * 0.72, 5)), 34, 74);
  context.font = `800 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  context.fillText(clean, canvas.width / 2, canvas.height / 2 + fontSize * 0.03);

  return sampleCanvasToCells(canvas, columns, rows, 38);
}

function activeCellRuns(cells: boolean[]): Array<[number, number]> {
  const runs: Array<[number, number]> = [];
  let start = -1;
  let length = 0;

  cells.forEach((active, index) => {
    if (active) {
      if (start === -1) {
        start = index;
      }
      length += 1;
      return;
    }

    if (start !== -1) {
      runs.push([start, length]);
      start = -1;
      length = 0;
    }
  });

  if (start !== -1) {
    runs.push([start, length]);
  }

  return runs;
}

function formatRuns(runs: Array<[number, number]>): string {
  if (runs.length === 0) return "[]";
  const chunks: string[] = [];
  for (let index = 0; index < runs.length; index += 8) {
    chunks.push(runs.slice(index, index + 8).map((run) => `[${run[0]},${run[1]}]`).join(", "));
  }
  return `[\n    ${chunks.join(",\n    ")}\n  ]`;
}

function buildCustomSourceCode(
  target: CodeTarget,
  sourceMode: SourceMode,
  customText: string,
  customField: CustomCellField | null,
  props: DotMatrixCommonProps
) {
  const shape = props.dotShape ?? "circle";
  const cellSize = formatNumber(Number(props.dotSize));
  const gap = formatNumber(Number(props.cellPadding ?? 1.5));
  const speedValue = formatNumber(Number(props.speed));
  const colorValue = props.color ?? "currentColor";

  const field = customField ?? { columns: 0, rows: 0, cells: [] };
  const runs = activeCellRuns(field.cells);
  const formattedRuns = formatRuns(runs);

  if (target === "json") {
    const textLine = sourceMode === "text" ? `  "text": ${JSON.stringify(customText)},\n` : "";
    return `{
  "source": "${sourceMode}",
${textLine}  "columns": ${field.columns},
  "rows": ${field.rows},
  "cellEncoding": "runs",
  "activeCellRuns": ${formattedRuns.replaceAll("\n", "\n  ")},
  "cellShape": "${shape}",
  "cellSize": ${cellSize},
  "cellGap": ${gap},
  "color": "${colorValue}",
  "speed": ${speedValue}
}`;
  }

  if (target === "css") {
    return `.cellforge-custom {
  --cf-cell-color: ${colorValue};
  --cf-cell-size: ${cellSize}px;
  --cf-cell-gap: ${gap}px;
  --cf-cell-speed: ${speedValue};
  --cf-cell-shape: ${shape};
}`;
  }

  if (target === "tailwind") {
    return `<CellForge${sourceMode === "text" ? "Text" : "Image"}
  className="text-[${colorValue}] [--cf-cell-size:${cellSize}px] [--cf-cell-gap:${gap}px]"
  ${sourceMode === "text" ? `text="${customText.replaceAll('"', '\\"')}"` : `activeCellRuns={${formattedRuns}}`}
/>`;
  }

  if (sourceMode === "text") {
    return `<CellForgeText
  text="${customText.replaceAll('"', '\\"')}"
  cellShape="${shape}"
  cellSize={${cellSize}}
  cellGap={${gap}}
  color="${colorValue}"
  speed={${speedValue}}
/>`;
  }

return `<CellForgeImage
  columns={${field.columns}}
  rows={${field.rows}}
  cellEncoding="runs"
  activeCellRuns={${formattedRuns}}
  cellShape="${shape}"
  cellSize={${cellSize}}
  cellGap={${gap}}
  color="${colorValue}"
  speed={${speedValue}}
/>`;
}

function buildCode(target: CodeTarget, selected: StudioLoaderOption, props: DotMatrixCommonProps) {
  const itemName = publicItemName(selected.slug);
  const componentName = packageImportName(selected.slug);
  const config = {
    loader: itemName,
    size: props.size,
    cellSize: props.dotSize,
    cellPadding: props.cellPadding ?? 0,
    speed: props.speed,
    color: props.color,
    pattern: props.pattern,
    shape: props.dotShape,
    bloom: props.bloom ?? false,
    muted: props.muted ?? false
  };

  if (target === "json") {
    return JSON.stringify(config, null, 2);
  }

  if (target === "css") {
    return `:root {
  --cf-loader-color: ${props.color};
  --cf-loader-size: ${formatNumber(Number(props.size))}px;
  --cf-cell-size: ${formatNumber(Number(props.dotSize))}px;
  --cf-cell-padding: ${formatNumber(Number(props.cellPadding ?? 0))}px;
  --cf-loader-speed: ${formatNumber(Number(props.speed))};
}`;
  }

  if (target === "tailwind") {
    return `<${componentName}
  className="text-white [--cf-loader-speed:${formatNumber(Number(props.speed))}]"
  size={${formatNumber(Number(props.size))}}
  dotSize={${formatNumber(Number(props.dotSize))}}
  cellPadding={${formatNumber(Number(props.cellPadding ?? 0))}}
  color="${props.color}"
  pattern="${props.pattern}"
  dotShape="${props.dotShape}"
/>`;
  }

  if (target === "vue") {
    return `<script setup lang="ts">
import { ${componentName} } from "@cellforge/react";
</script>

<template>
  <${componentName}
    :size="${formatNumber(Number(props.size))}"
    :dot-size="${formatNumber(Number(props.dotSize))}"
    :cell-padding="${formatNumber(Number(props.cellPadding ?? 0))}"
    color="${props.color}"
    pattern="${props.pattern}"
    dot-shape="${props.dotShape}"
  />
</template>`;
  }

  if (target === "svelte") {
    return `<script lang="ts">
  import { ${componentName} } from "@cellforge/react";
</script>

<${componentName}
  size={${formatNumber(Number(props.size))}}
  dotSize={${formatNumber(Number(props.dotSize))}}
  cellPadding={${formatNumber(Number(props.cellPadding ?? 0))}}
  color="${props.color}"
  pattern="${props.pattern}"
  dotShape="${props.dotShape}"
/>`;
  }

  if (target === "rn") {
    return `import { CellLoader } from "@cellforge/react-native";

export function LoadingState() {
  return (
    <CellLoader
      preset="${itemName}"
      size={${formatNumber(Number(props.size))}}
      cellSize={${formatNumber(Number(props.dotSize))}}
      color="${props.color}"
      speed={${formatNumber(Number(props.speed))}}
    />
  );
}`;
  }

  if (target === "swiftui") {
    return `CellForgeLoader(
  preset: "${itemName}",
  size: ${formatNumber(Number(props.size))},
  cellSize: ${formatNumber(Number(props.dotSize))},
  color: "${props.color}",
  speed: ${formatNumber(Number(props.speed))}
)`;
  }

  if (target === "lottie") {
    return `{
  "preset": "${itemName}",
  "renderer": "lottie",
  "size": ${formatNumber(Number(props.size))},
  "cellSize": ${formatNumber(Number(props.dotSize))},
  "color": "${props.color}",
  "speed": ${formatNumber(Number(props.speed))}
}`;
  }

  return `import { ${componentName} } from "@cellforge/react";

export function LoadingState() {
  return (
    <${componentName}
      size={${formatNumber(Number(props.size))}}
      dotSize={${formatNumber(Number(props.dotSize))}}
      cellPadding={${formatNumber(Number(props.cellPadding ?? 0))}}
      speed={${formatNumber(Number(props.speed))}}
      color="${props.color}"
      pattern="${props.pattern}"
      dotShape="${props.dotShape}"
      ${props.bloom ? "bloom" : ""}
    />
  );
}`;
}

export function StudioClient({ initialSlug, loaders }: StudioClientProps) {
  const fallbackSlug = loaders[0]?.slug ?? "dotm-square-1";
  const [selectedSlug, setSelectedSlug] = useState(
    loaders.some((loader) => loader.slug === initialSlug) ? initialSlug ?? fallbackSlug : fallbackSlug
  );
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [frameMode, setFrameMode] = useState<FrameMode>("canvas");
  const [codeTarget, setCodeTarget] = useState<CodeTarget>("react");
  const [speed, setSpeed] = useState(1);
  const [dotSize, setDotSize] = useState(4);
  const [cellPadding, setCellPadding] = useState(1.5);
  const [size, setSize] = useState(112);
  const [color, setColor] = useState("#ffffff");
  const [pattern, setPattern] = useState<MatrixPattern>("full");
  const [dotShape, setDotShape] = useState<DotShape>("circle");
  const [sourceMode, setSourceMode] = useState<SourceMode>("preset");
  const [customText, setCustomText] = useState("CellForge");
  const [customTextField, setCustomTextField] = useState<CustomCellField | null>(null);
  const [customImageField, setCustomImageField] = useState<CustomCellField | null>(null);
  const [customImageName, setCustomImageName] = useState<string | null>(null);
  const [bloom, setBloom] = useState(false);
  const [muted, setMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected = loaders.find((loader) => loader.slug === selectedSlug) ?? loaders[0];
  const groupedLoaders = useMemo(() => {
    const groups = new Map<string, StudioLoaderOption[]>();
    for (const loader of loaders) {
      const label = familyLabel(loader.slug);
      groups.set(label, [...(groups.get(label) ?? []), loader]);
    }
    return [...groups.entries()];
  }, [loaders]);

  useEffect(() => {
    const defaults = LOADER_GALLERY_PREVIEW_PROPS[selectedSlug] ?? LOADER_GALLERY_PREVIEW_PROPS[fallbackSlug];
    setSpeed(defaults?.speed ?? 1);
    setDotSize(clamp(defaults?.dotSize ?? 4, 2, 16));
    setCellPadding(defaults?.cellPadding ?? 1.5);
    setSize(Math.round(clamp((defaults?.size ?? 36) * 2.7, 72, 180)));
    setPattern((defaults?.pattern ?? "full") as MatrixPattern);
    setDotShape((defaults?.dotShape ?? "circle") as DotShape);
    setBloom(Boolean(defaults?.bloom));
    setMuted(false);
  }, [fallbackSlug, selectedSlug]);

  useEffect(() => {
    return () => {
      if (copiedTimeout.current) {
        clearTimeout(copiedTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (sourceMode !== "text") {
      return;
    }
    setCustomTextField(renderTextToCells(customText));
  }, [customText, sourceMode]);

  const SelectedLoader = loaderComponentMap[selected?.slug ?? fallbackSlug] ?? DotMatrixIcon;
  const props: DotMatrixCommonProps = {
    size,
    dotSize,
    cellPadding,
    speed,
    color,
    colorPreset: undefined as DotMatrixColorPreset | undefined,
    pattern,
    dotShape,
    animated: true,
    bloom,
    muted
  };
  const activeCustomField = sourceMode === "text" ? customTextField : sourceMode === "image" ? customImageField : null;
  const generatedCode =
    sourceMode === "preset"
      ? selected ? buildCode(codeTarget, selected, props) : ""
      : buildCustomSourceCode(codeTarget, sourceMode, customText, activeCustomField, props);
  const previewStyle = { "--cf-preview-color": color } as CSSProperties;
  const activePreviewTitle =
    sourceMode === "preset" ? selected?.title : sourceMode === "text" ? "Custom text field" : "Custom image field";
  const activePreviewDescription =
    sourceMode === "preset"
      ? selected?.description
      : sourceMode === "text"
        ? "Type any name or word and CellForge converts it into animated cells."
        : customImageName
          ? `${customImageName} converted into an animated cell field.`
          : "Upload an image to convert its silhouette into animated cells.";
  const activePreviewKicker =
    sourceMode === "preset" ? selected ? publicItemName(selected.slug) : "cell-square-1" : sourceMode;

  const handleImageUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const columns = 56;
        const rows = 34;
        const scale = 5;
        const canvas = document.createElement("canvas");
        canvas.width = columns * scale;
        canvas.height = rows * scale;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) {
          return;
        }
        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        const imageRatio = image.width / image.height;
        const canvasRatio = canvas.width / canvas.height;
        const drawWidth = imageRatio > canvasRatio ? canvas.width : canvas.height * imageRatio;
        const drawHeight = imageRatio > canvasRatio ? canvas.width / imageRatio : canvas.height;
        const dx = (canvas.width - drawWidth) / 2;
        const dy = (canvas.height - drawHeight) / 2;
        context.drawImage(image, dx, dy, drawWidth, drawHeight);
        setCustomImageField(sampleCanvasToCells(canvas, columns, rows, 42));
        setCustomImageName(file.name);
      };
      if (typeof reader.result === "string") {
        image.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const copyCode = useCallback(async () => {
    if (!navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    if (copiedTimeout.current) clearTimeout(copiedTimeout.current);
    copiedTimeout.current = setTimeout(() => {
      setCopied(false);
      copiedTimeout.current = null;
    }, 1400);
  }, [generatedCode]);

  const compareLoaders = useMemo(() => {
    if (!selected) return [];
    const currentIndex = loaders.findIndex((loader) => loader.slug === selected.slug);
    return [0, 1, 2, 3].map((offset) => loaders[(currentIndex + offset) % loaders.length]).filter(Boolean);
  }, [loaders, selected]);

  return (
    <main className="cf-studio-surface min-h-dvh bg-background pt-20 text-fg-strong">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <section className="grid gap-4 py-6 sm:py-7">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-fg-dim">CellForge Studio</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
              Tune the loader, then ship the exact code.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted sm:text-base">
              Select any loader, adjust motion and geometry, preview it in real UI frames, and export for the stack you need.
            </p>
          </div>
        </section>
      </div>

      <section className="mx-auto grid w-full max-w-[1400px] overflow-hidden border-y border-border-soft bg-surface/55 shadow-[0_24px_90px_-70px_rgba(0,0,0,0.9)] sm:border-x lg:grid-cols-[232px_minmax(0,1fr)_292px] lg:items-start">
          <aside className="max-h-[430px] overflow-y-auto border-b border-border-soft bg-surface/80 lg:sticky lg:top-20 lg:max-h-[720px] lg:border-b-0 lg:border-r">
            <div className="py-3">
            {groupedLoaders.map(([group, groupLoaders]) => (
              <div key={group} className="pb-4">
                <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-fg-dim">
                  {group}
                </p>
                <div className="grid gap-1">
                  {groupLoaders.map((loader) => {
                    const Preview = loaderComponentMap[loader.slug] ?? DotMatrixIcon;
                    const active = loader.slug === selected?.slug;
                    return (
                      <button
                        key={loader.slug}
                        type="button"
                        onClick={() => setSelectedSlug(loader.slug)}
                        className={`grid grid-cols-[34px_1fr] items-center gap-2 px-3 py-2.5 text-left transition ${
                          active ? "bg-background/75 text-fg-strong" : "text-fg-muted hover:bg-background/45 hover:text-fg-strong"
                        }`}
                      >
                        <span className="flex size-7 items-center justify-center">
                          <ReducedMotionOverrideProvider reducedMotion={false}>
                            <Preview size={22} dotSize={2.3} animated dotShape={dotShape} />
                          </ReducedMotionOverrideProvider>
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-semibold">{loader.title}</span>
                          <span className="mt-0.5 block truncate text-[9px] uppercase tracking-[0.14em] text-fg-dim">
                            {publicItemName(loader.slug)}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            </div>
          </aside>

          <section className="grid w-full grid-rows-[auto_auto_auto] bg-background/20">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-soft bg-surface/35 px-4 py-3.5">
            <Segmented
              label="Source"
              value={sourceMode}
              options={sourceModeOptions}
              onChange={(value) => setSourceMode(value as SourceMode)}
            />
            <Segmented
              label="View"
              value={viewMode}
              options={[
                { label: "Single", value: "single" },
                { label: "Compare", value: "compare" }
              ]}
              onChange={(value) => setViewMode(value as ViewMode)}
            />
            <Segmented
              label="Frame"
              value={frameMode}
              options={frameModeOptions}
              onChange={(value) => setFrameMode(value as FrameMode)}
            />
          </div>

          <div className="relative flex min-h-[540px] items-center justify-center overflow-hidden border-b border-border-soft p-8 pt-24 sm:p-10 sm:pt-24" style={previewStyle}>
            <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:44px_44px]" />
            <div className="absolute left-5 top-5 z-10 max-w-md rounded-lg bg-background/45 px-3 py-2 backdrop-blur-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-fg-dim">
                {activePreviewKicker}
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-fg-strong">
                {activePreviewTitle}
              </h2>
              <p className="mt-1 max-w-[48ch] text-xs leading-relaxed text-fg-muted">
                {activePreviewDescription}
              </p>
            </div>
            {sourceMode !== "preset" ? (
              <PreviewFrame frameMode={frameMode}>
                <CustomCellFieldPreview
                  field={activeCustomField}
                  color={color}
                  dotShape={dotShape}
                  dotSize={dotSize}
                  cellPadding={cellPadding}
                  speed={speed}
                  bloom={bloom}
                  muted={muted}
                />
              </PreviewFrame>
            ) : viewMode === "compare" ? (
              <div className="relative grid w-full max-w-2xl grid-cols-2 gap-4">
                {compareLoaders.map((loader) => {
                  const CompareLoader = loaderComponentMap[loader.slug] ?? DotMatrixIcon;
                  return (
                    <div key={loader.slug} className="grid min-h-28 place-items-center border border-border-soft bg-background/35 p-5">
                      <ReducedMotionOverrideProvider reducedMotion={false}>
                        <CompareLoader {...props} size={Math.round(size * 0.62)} />
                      </ReducedMotionOverrideProvider>
                      <p className="mt-5 text-xs text-fg-dim">{loader.title}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <PreviewFrame frameMode={frameMode}>
                <ReducedMotionOverrideProvider reducedMotion={false}>
                  <SelectedLoader {...props} />
                </ReducedMotionOverrideProvider>
              </PreviewFrame>
            )}
          </div>

          <div className="border-t border-border-soft bg-surface/80">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-soft px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-fg-dim">Generated code</p>
              <div className="flex flex-wrap items-center gap-2">
                {codeTargets.map((target) => (
                  <button
                    key={target.value}
                    type="button"
                    onClick={() => setCodeTarget(target.value)}
                    className={`rounded-md px-2.5 py-1.5 text-xs transition ${
                      codeTarget === target.value ? "bg-fg-strong text-background" : "text-fg-muted hover:bg-background/45 hover:text-fg-strong"
                    }`}
                  >
                    {target.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => void copyCode()}
                  className="inline-flex items-center gap-2 rounded-md bg-fg-strong px-3 py-1.5 text-xs font-medium text-background transition hover:opacity-85"
                >
                  {copied ? <CheckIcon className="size-4" /> : <CopyClipboardIcon className="size-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <div className={`${GeistMono.className} max-h-[340px] min-h-[220px] overflow-auto overscroll-contain p-4 text-sm`}>
              <ShikiCodeView
                code={generatedCode}
                lang={codeTarget === "json" || codeTarget === "lottie" ? "json" : codeTarget === "css" ? "css" : "tsx"}
                lineNumbers={false}
                className="[&_.shiki]:!bg-transparent [&_.shiki]:![background-color:transparent]"
              />
            </div>
          </div>
        </section>

        <aside className="border-t border-border-soft bg-surface/80 p-3.5 lg:border-l lg:border-t-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-fg-dim">Controls</p>

          <div className="mt-3 grid gap-3.5">
            <Segmented
              label="Pattern"
              value={pattern}
              options={patternOptions}
              onChange={(value) => setPattern(value as MatrixPattern)}
              wide
            />
            <Segmented
              label="Cell shape"
              value={dotShape}
              options={dotShapeOptions}
              onChange={(value) => setDotShape(value as DotShape)}
              wide
            />

            <div className="rounded-xl border border-border-soft bg-background/30 p-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-fg-dim">Source</p>
              {sourceMode === "preset" ? (
                <p className="mt-2 text-sm font-medium text-fg-strong">{selected?.title}</p>
              ) : sourceMode === "text" ? (
                <label className="mt-3 grid gap-2">
                  <span className="text-xs text-fg-muted">Text</span>
                  <input
                    value={customText}
                    onChange={(event) => setCustomText(event.target.value)}
                    className="w-full rounded-lg border border-border-soft bg-surface/70 px-3 py-2 text-sm text-fg-strong outline-none transition focus:border-border"
                    maxLength={18}
                    aria-label="Custom text source"
                  />
                </label>
              ) : (
                <div className="mt-3 grid gap-2">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-border-soft bg-surface/70 px-3 py-2 text-sm font-medium text-fg-strong transition hover:border-border">
                    Upload image
                    <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
                  </label>
                  <p className="truncate text-xs text-fg-muted">{customImageName ?? "No image selected"}</p>
                </div>
              )}
            </div>

            <ControlRange label="Speed" value={speed} min={0.2} max={3} step={0.05} suffix="x" onChange={setSpeed} />
            <ControlRange label="Cell size" value={dotSize} min={2} max={16} step={0.5} suffix="px" onChange={setDotSize} />
            <ControlRange label="Cell padding" value={cellPadding} min={0} max={8} step={0.5} suffix="px" onChange={setCellPadding} />
            <ControlRange label="Export size" value={size} min={64} max={180} step={1} suffix="px" onChange={setSize} />

            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-fg-dim">Color</p>
                <span className="font-mono text-xs text-fg-muted">{color}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  className="size-9 cursor-pointer rounded-lg border border-border-soft bg-transparent p-1"
                  aria-label="Custom color"
                />
                <input
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-border-soft bg-background/45 px-3 py-2 font-mono text-xs text-fg-strong outline-none transition focus:border-border"
                  aria-label="Color hex"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    aria-label={preset.label}
                    onClick={() => setColor(preset.value)}
                    className={`size-7 rounded-full border transition ${
                      color.toLowerCase() === preset.value ? "border-fg-strong ring-2 ring-fg-muted/70 ring-offset-2 ring-offset-surface" : "border-border-soft"
                    }`}
                    style={{ backgroundColor: preset.value }}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Toggle label="Bloom" checked={bloom} onChange={setBloom} />
              <Toggle label="Muted" checked={muted} onChange={setMuted} />
            </div>
          </div>
        </aside>
        </section>
      <div className="h-10" />
    </main>
  );
}

function Segmented({
  label,
  value,
  options,
  onChange,
  wide
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "grid gap-2" : "flex items-center gap-3"}>
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-fg-dim">{label}</p>
      <div className={`flex flex-wrap rounded-lg border border-border-soft bg-background/35 p-0.5 ${wide ? "w-full" : ""}`}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              value === option.value ? "bg-fg-strong text-background shadow-sm" : "text-fg-muted hover:text-fg-strong"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ControlRange({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  const progress = ((value - min) / (max - min)) * 100;
  return (
    <label className="grid gap-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-fg-muted">{label}</span>
        <span className="font-mono text-fg-muted">
          {formatNumber(value)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-5 w-full cursor-ew-resize appearance-none rounded-full border border-border-soft bg-background/35 px-0 accent-[var(--color-dot-on)]"
        style={{
          background: `linear-gradient(90deg, color-mix(in srgb, var(--color-dot-on) 22%, transparent) 0%, color-mix(in srgb, var(--color-dot-on) 22%, transparent) ${progress}%, var(--color-shell-overlay) ${progress}%, var(--color-shell-overlay) 100%)`
        }}
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
        checked ? "border-border bg-background/70 text-fg-strong" : "border-border-soft bg-background/35 text-fg-muted"
      }`}
    >
      <span>{label}</span>
      <span className="font-mono text-xs">{checked ? "On" : "Off"}</span>
    </button>
  );
}

function CustomCellFieldPreview({
  field,
  color,
  dotShape,
  dotSize,
  cellPadding,
  speed,
  bloom,
  muted
}: {
  field: CustomCellField | null;
  color: string;
  dotShape: DotShape;
  dotSize: number;
  cellPadding: number;
  speed: number;
  bloom: boolean;
  muted: boolean;
}) {
  if (!field || field.cells.length === 0) {
    return (
      <div className="grid min-h-28 place-items-center rounded-xl border border-dashed border-border-soft px-6 text-sm text-fg-muted">
        Waiting for source
      </div>
    );
  }

  const cell = clamp(dotSize, 2, 16);
  const gap = clamp(cellPadding, 0, 8);
  const cycleScale = 1 / Math.max(speed, 0.1);
  const gridStyle = {
    gridTemplateColumns: `repeat(${field.columns}, ${formatNumber(cell)}px)`,
    gap: `${formatNumber(gap)}px`
  } as CSSProperties;
  const rootStyle = {
    color,
    "--dmx-dot-fill": color,
    "--dmx-dot-size": `${formatNumber(cell)}px`,
    "--cf-custom-speed": String(cycleScale)
  } as CSSProperties;

  return (
    <div
      role="img"
      aria-label="Custom animated cell field"
      className={`cf-custom-cell-field dmx-root dmx-motion-enabled dmx-dot-shape-${dotShape} ${
        bloom ? "dmx-bloom dmx-bloom-halo" : ""
      } ${muted ? "dmx-muted" : ""}`}
      style={rootStyle}
    >
      <div className="cf-custom-cell-grid" style={gridStyle}>
        {field.cells.map((active, index) =>
          active ? (
            <span
              key={index}
              className="dmx-dot cf-custom-cell"
              style={{
                width: `${formatNumber(cell)}px`,
                height: `${formatNumber(cell)}px`,
                animationDelay: `${(index % field.columns) * 13 + Math.floor(index / field.columns) * 21}ms`
              }}
            />
          ) : (
            <span
              key={index}
              className="cf-custom-cell-space"
              style={{ width: `${formatNumber(cell)}px`, height: `${formatNumber(cell)}px` }}
            />
          )
        )}
      </div>
    </div>
  );
}

function PreviewFrame({ frameMode, children }: { frameMode: FrameMode; children: ReactNode }) {
  if (frameMode === "canvas") {
    return (
      <div className="relative grid size-[260px] place-items-center rounded-2xl border border-border-soft bg-background/30 shadow-2xl sm:size-[300px]">
        <div className="absolute inset-5 rounded-xl border border-dashed border-border-soft" />
        <div className="absolute left-5 top-5 rounded-md border border-border-soft bg-surface/75 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-fg-dim">
          Free stage
        </div>
        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-[10px] text-fg-dim">
          <span>128px</span>
          <span>motion preview</span>
        </div>
        {children}
      </div>
    );
  }

  if (frameMode === "inline") {
    return (
      <button type="button" className="relative inline-flex items-center gap-3 rounded-xl border border-border-soft bg-surface/80 px-4 py-3 text-sm text-fg-strong shadow-2xl">
        <span className="grid size-8 place-items-center rounded-lg bg-background/55">{children}</span>
        <span className="grid gap-0.5 text-left">
          <span className="font-semibold">Syncing invoice</span>
          <span className="text-xs text-fg-dim">Saving payment state</span>
        </span>
      </button>
    );
  }

  if (frameMode === "agent") {
    return (
      <div className="relative w-full max-w-md rounded-2xl border border-border-soft bg-background/45 p-4 shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-border-soft pb-3">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-fg-dim">Agent run</p>
          <span className="rounded-full border border-border-soft bg-surface/80 px-2 py-1 text-[10px] text-fg-muted">live</span>
        </div>
        <div className="mt-4 grid gap-3">
          <div className="flex items-center gap-3 rounded-lg bg-surface/70 p-3">
            <span className="grid size-9 place-items-center rounded-lg bg-background/60">{children}</span>
            <div className="grid flex-1 gap-1.5">
              <span className="h-2 rounded-full bg-fg-dim/25" />
              <span className="h-2 w-2/3 rounded-full bg-fg-dim/15" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="h-8 rounded-lg border border-border-soft bg-background/35" />
            <span className="h-8 rounded-lg border border-border-soft bg-background/35" />
            <span className="h-8 rounded-lg border border-border-soft bg-background/35" />
          </div>
        </div>
      </div>
    );
  }

  if (frameMode === "form") {
    return (
      <div className="relative w-full max-w-sm rounded-2xl border border-border-soft bg-background/45 p-4 shadow-2xl">
        <div className="mb-4">
          <p className="text-xs font-semibold text-fg-strong">Create workspace</p>
          <p className="mt-1 text-xs text-fg-muted">Provisioning settings and members.</p>
        </div>
        <div className="grid gap-2">
          <span className="h-9 rounded-lg border border-border-soft bg-surface/80" />
          <span className="h-9 rounded-lg border border-border-soft bg-surface/80" />
          <button type="button" className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-fg-strong px-3 py-2 text-sm font-semibold text-background">
            {children}
            Creating
          </button>
        </div>
      </div>
    );
  }

  if (frameMode === "table") {
    return (
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border-soft bg-background/45 shadow-2xl">
        <div className="grid grid-cols-[1fr_90px_70px] border-b border-border-soft bg-surface/70 px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-fg-dim">
          <span>Job</span>
          <span>Status</span>
          <span>Queue</span>
        </div>
        <div className="grid divide-y divide-border-soft">
          {["Export assets", "Sync registry", "Warm cache"].map((label, index) => (
            <div key={label} className="grid grid-cols-[1fr_90px_70px] items-center px-4 py-3 text-sm">
              <span className="text-fg-strong">{label}</span>
              <span className="text-fg-muted">{index === 1 ? "Running" : "Ready"}</span>
              <span className="flex justify-end">{index === 1 ? children : <span className="size-2 rounded-full bg-fg-dim/35" />}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (frameMode === "surface") {
    return (
      <div className="relative grid min-h-[280px] w-full max-w-lg overflow-hidden rounded-2xl border border-border-soft bg-background/35 p-5 shadow-2xl">
        <div className="grid grid-cols-[1fr_auto] items-start gap-4">
          <div className="grid flex-1 gap-2">
            <span className="h-3 w-28 rounded-full bg-fg-dim/20" />
            <span className="h-2 w-44 rounded-full bg-fg-dim/12" />
          </div>
          <span className="h-8 w-24 rounded-lg border border-border-soft bg-surface/70" />
        </div>
        <div className="mt-6 grid grid-cols-[1fr_auto] items-center gap-5 rounded-xl border border-border-soft bg-surface/55 p-4">
          <div className="grid gap-2">
            <span className="h-2.5 rounded-full bg-fg-dim/20" />
            <span className="h-2 w-3/4 rounded-full bg-fg-dim/15" />
            <span className="h-2 w-1/2 rounded-full bg-fg-dim/10" />
          </div>
          <div className="grid size-24 place-items-center rounded-xl bg-background/45">{children}</div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <span className="h-12 rounded-lg bg-fg-dim/10" />
          <span className="h-12 rounded-lg bg-fg-dim/10" />
          <span className="h-12 rounded-lg bg-fg-dim/10" />
        </div>
      </div>
    );
  }

  return <div className="relative">{children}</div>;
}
