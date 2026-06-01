"use client";

import { DialStore, useDialKit } from "dialkit";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { CheckIcon, CopyClipboardIcon } from "@/components/package-manager-install-toolbar";
import { ShikiCodeView } from "@/components/shiki-code-view";
import {
  LOADER_GALLERY_DEFAULT_DETAIL_DOT_BOOST,
  LOADER_GALLERY_DEFAULT_DETAIL_PREVIEW_SCALE
} from "@/components/loader-gallery-defaults";
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

interface PlaygroundLoaderOption {
  slug: string;
  title: string;
  componentName: string;
}

interface PlaygroundClientProps {
  initialSlug?: string;
  loaders: PlaygroundLoaderOption[];
  mode?: "playground" | "studio";
}

const patternOptions: { value: MatrixPattern; label: string }[] = [
  { value: "full", label: "Full" },
  { value: "diamond", label: "Diamond" },
  { value: "outline", label: "Outline" },
  { value: "cross", label: "Cross" },
  { value: "rings", label: "Rings" },
  { value: "rose", label: "Rose" }
];

const dotShapeOptions: { value: DotShape; label: string }[] = [
  { value: "circle", label: "Circle" },
  { value: "square", label: "Square" },
  { value: "diamond", label: "Diamond" },
  { value: "pill", label: "Pill" },
  { value: "triangle", label: "Triangle" },
  { value: "hex", label: "Hex" },
  { value: "plus", label: "Plus" },
  { value: "star", label: "Star" },
  { value: "hearts", label: "Hearts" }
];

const DEFAULT_THEME_COLOR = "#f4f4f5";
const DEFAULT_COLOR_PRESET = "solid-theme";

const PLAYGROUND_COLOR_PRESETS = [
  { id: "solid-theme", label: "Ink", fill: "var(--color-dot-on)", glow: "var(--color-dot-on)" },
  { id: "solid-mint", label: "Alloy", fill: "#8dd7c8", glow: "#8dd7c8" },
  {
    id: "grad-sunset",
    label: "Signal",
    fill: "linear-gradient(135deg, #f8f4d8 0%, #8dd7c8 48%, #29524a 100%)",
    glow: "#8dd7c8"
  },
  {
    id: "grad-ocean",
    label: "Blueprint",
    fill: "linear-gradient(140deg, #d9e8ff 0%, #5b87c7 48%, #15263f 100%)",
    glow: "#6e9fe8"
  },
  {
    id: "grad-neon",
    label: "Flux",
    fill: "linear-gradient(145deg, #f5ff74 0%, #51e6a2 48%, #2a7a58 100%)",
    glow: "#91f0a7"
  },
  {
    id: "grad-aurora",
    label: "Ion",
    fill: "linear-gradient(145deg, #e7ddff 0%, #9987c9 44%, #34314b 100%)",
    glow: "#a99be4"
  },
  {
    id: "grad-fire",
    label: "Heatline",
    fill: "linear-gradient(145deg, #ffe2b8 0%, #d47454 48%, #4a231d 100%)",
    glow: "#e8916e"
  },
  {
    id: "grad-prism",
    label: "Vapor",
    fill: "linear-gradient(145deg, #f1f5f9 0%, #9aa6b2 45%, #3a4048 100%)",
    glow: "#b7c0cc"
  }
] as const;

function clampOpacity(value: number | undefined, fallback: number) {
  return Math.min(1, Math.max(0, value ?? fallback));
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function publicItemName(slug: string): string {
  return slug
    .replace(/^dotm-square-/, "cell-square-")
    .replace(/^dotm-circular-/, "cell-orbit-")
    .replace(/^dotm-triangle-/, "cell-angle-")
    .replace(/^dotm-hex-/, "cell-lattice-");
}

function packageImportName(slug: string): string {
  return publicItemName(slug)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function PlaygroundClient({ initialSlug, loaders, mode = "playground" }: PlaygroundClientProps) {
  const fallbackSlug = loaders[0]?.slug ?? "dotm-square-1";
  const defaultSlug = loaders.some((loader) => loader.slug === initialSlug)
    ? initialSlug ?? fallbackSlug
    : fallbackSlug;
  const defaultProps = LOADER_GALLERY_PREVIEW_PROPS[defaultSlug] ?? LOADER_GALLERY_PREVIEW_PROPS[fallbackSlug];
  const loaderSelectOptions = useMemo(
    () =>
      loaders.map((loader) => ({
        value: loader.slug,
        label: loader.title
      })),
    [loaders]
  );

  const controls = useDialKit(
    "CellForge Playground",
    {
      loader: {
        type: "select",
        default: defaultSlug,
        options: loaderSelectOptions
      },
      size: [
        Math.round((defaultProps.size ?? 30) * LOADER_GALLERY_DEFAULT_DETAIL_PREVIEW_SCALE),
        18,
        220,
        1
      ],
      dotSize: [
        Number(((defaultProps.dotSize ?? 4) + LOADER_GALLERY_DEFAULT_DETAIL_DOT_BOOST).toFixed(1)),
        1,
        22,
        0.5
      ],
      speed: [defaultProps.speed ?? 1.2, 0.1, 7, 0.05],
      colorPreset: {
        type: "select",
        default: DEFAULT_COLOR_PRESET,
        options: [
          { value: "custom", label: "Custom" },
          ...PLAYGROUND_COLOR_PRESETS.map((preset) => ({
            value: preset.id,
            label: preset.label
          }))
        ]
      },
      customColor: {
        type: "color",
        default: DEFAULT_THEME_COLOR
      },
      pattern: {
        type: "select",
        default: defaultProps.pattern ?? "full",
        options: patternOptions
      },
      dotShape: {
        type: "select",
        default: defaultProps.dotShape ?? "circle",
        options: dotShapeOptions
      },
      states: {
        _collapsed: false,
        animated: defaultProps.animated ?? true,
        hoverAnimated: false,
        muted: false,
        bloom: defaultProps.bloom ?? false,
        halo: [defaultProps.halo ?? 0, 0, 1, 0.01]
      },
      opacity: {
        _collapsed: false,
        base: [clampOpacity(defaultProps.opacityBase, 0.12), 0, 1, 0.01],
        mid: [clampOpacity(defaultProps.opacityMid, 0.42), 0, 1, 0.01],
        peak: [clampOpacity(defaultProps.opacityPeak, 1), 0, 1, 0.01]
      },
      preview: {
        zoom: [1, 0.75, 4, 0.05]
      },
      layout: {
        _collapsed: true,
        cellPadding: [defaultProps.cellPadding ?? 0, 0, 28, 0.5],
        boxSize: [0, 0, 280, 1],
        minSize: [0, 0, 280, 1]
      }
    },
    {
      shortcuts: {
        size: { key: "s", interaction: "drag" },
        dotSize: { key: "d", interaction: "drag", mode: "fine" },
        speed: { key: "v", interaction: "scroll", mode: "fine" }
      }
    }
  );
  const [snippetCopied, setSnippetCopied] = useState(false);
  const snippetCopyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCustomColorRef = useRef(controls.customColor);

  useEffect(() => {
    if (controls.customColor === prevCustomColorRef.current) {
      return;
    }

    prevCustomColorRef.current = controls.customColor;

    if (controls.colorPreset === "custom") {
      return;
    }

    const panel = DialStore.getPanels().find((entry) => entry.name === "CellForge Playground");
    if (!panel) {
      return;
    }

    DialStore.updateValue(panel.id, "colorPreset", "custom");
  }, [controls.customColor, controls.colorPreset]);

  useEffect(() => {
    return () => {
      if (snippetCopyResetRef.current) {
        clearTimeout(snippetCopyResetRef.current);
      }
    };
  }, []);

  const selectedLoader = loaders.find((loader) => loader.slug === controls.loader) ?? loaders[0];
  const SelectedLoader =
    loaderComponentMap[selectedLoader?.slug ?? fallbackSlug] ?? loaderComponentMap[fallbackSlug] ?? DotMatrixIcon;
  const customColor =
    controls.customColor.toLowerCase() === DEFAULT_THEME_COLOR
      ? "var(--color-dot-on)"
      : controls.customColor;
  const resolvedColorPreset =
    controls.colorPreset === "custom" ? undefined : (controls.colorPreset as DotMatrixColorPreset);
  const props: DotMatrixCommonProps = {
    size: controls.size,
    dotSize: controls.dotSize,
    speed: controls.speed,
    color: customColor,
    ...(resolvedColorPreset ? { colorPreset: resolvedColorPreset } : {}),
    pattern: controls.pattern as MatrixPattern,
    dotShape: controls.dotShape as DotShape,
    animated: controls.states.animated,
    hoverAnimated: controls.states.hoverAnimated,
    muted: controls.states.muted,
    bloom: controls.states.bloom,
    ...(controls.states.halo > 0 ? { halo: controls.states.halo } : {}),
    opacityBase: controls.opacity.base,
    opacityMid: controls.opacity.mid,
    opacityPeak: controls.opacity.peak
  };

  if (controls.layout.cellPadding > 0) {
    props.cellPadding = controls.layout.cellPadding;
  }

  if (controls.layout.boxSize > 0) {
    props.boxSize = controls.layout.boxSize;
  }

  if (controls.layout.minSize > 0) {
    props.minSize = controls.layout.minSize;
  }

  const previewStyle = {
    transform: `scale(${controls.preview.zoom})`,
    transformOrigin: "center center"
  } as CSSProperties;
  const snippet = useMemo(() => {
    const componentName = selectedLoader ? packageImportName(selectedLoader.slug) : "CellLoader";
    const propLines: string[] = [
      `size={${formatNumber(controls.size)}}`,
      `dotSize={${formatNumber(controls.dotSize)}}`,
      `speed={${formatNumber(controls.speed)}}`,
      `pattern="${controls.pattern}"`
    ];

    if (controls.dotShape !== "circle") {
      propLines.push(`dotShape="${controls.dotShape}"`);
    }

    if (resolvedColorPreset) {
      propLines.push(`colorPreset="${resolvedColorPreset}"`);
    } else {
      propLines.push(`color="${customColor}"`);
    }

    if (controls.states.animated) {
      propLines.push("animated");
    }
    if (controls.states.hoverAnimated) {
      propLines.push("hoverAnimated");
    }
    if (controls.states.muted) {
      propLines.push("muted");
    }
    if (controls.states.bloom) {
      propLines.push("bloom");
    }
    if (controls.states.halo > 0) {
      propLines.push(`halo={${formatNumber(controls.states.halo)}}`);
    }

    propLines.push(
      `opacityBase={${formatNumber(controls.opacity.base)}}`,
      `opacityMid={${formatNumber(controls.opacity.mid)}}`,
      `opacityPeak={${formatNumber(controls.opacity.peak)}}`
    );

    if (controls.layout.cellPadding > 0) {
      propLines.push(`cellPadding={${formatNumber(controls.layout.cellPadding)}}`);
    }
    if (controls.layout.boxSize > 0) {
      propLines.push(`boxSize={${formatNumber(controls.layout.boxSize)}}`);
    }
    if (controls.layout.minSize > 0) {
      propLines.push(`minSize={${formatNumber(controls.layout.minSize)}}`);
    }

    return `<${componentName}
  ${propLines.join("\n  ")}
/>`;
  }, [
    selectedLoader,
    controls.size,
    controls.dotSize,
    controls.speed,
    controls.pattern,
    controls.dotShape,
    controls.states.animated,
    controls.states.hoverAnimated,
    controls.states.muted,
    controls.states.bloom,
    controls.states.halo,
    controls.opacity.base,
    controls.opacity.mid,
    controls.opacity.peak,
    controls.layout.cellPadding,
    controls.layout.boxSize,
    controls.layout.minSize,
    customColor,
    resolvedColorPreset
  ]);
  const copySnippet = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      return;
    }
    try {
      await navigator.clipboard.writeText(snippet);
      setSnippetCopied(true);
      if (snippetCopyResetRef.current) {
        clearTimeout(snippetCopyResetRef.current);
      }
      snippetCopyResetRef.current = setTimeout(() => {
        setSnippetCopied(false);
        snippetCopyResetRef.current = null;
      }, 1400);
    } catch {
      // Ignore unsupported contexts.
    }
  }, [snippet]);

  return (
    <main className="cf-playground-surface mx-auto flex min-h-dvh w-full max-w-[1380px] flex-1 flex-col bg-background px-4 pb-8 pt-24 sm:px-6 lg:px-8">
      <section className="grid gap-4 pb-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-fg-dim">CellForge Playground</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-fg-strong sm:text-5xl">
            Fast experiments before Studio polish.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted sm:text-base">
            Playground is for rough tuning, extreme ranges, and quick prop checks. Use Studio when you want the final export flow.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border-soft bg-surface/70 p-2.5 text-sm">
          <Link href="/studio" className="rounded-lg bg-fg-strong px-3 py-2 text-center font-semibold text-background">
            Open Studio
          </Link>
          <Link href="/" className="rounded-lg border border-border-soft px-3 py-2 text-center font-semibold text-fg-strong">
            Gallery
          </Link>
        </div>
      </section>
      <div className="w-full">
        <section className="relative flex min-h-[690px] flex-col overflow-hidden rounded-xl border border-border-soft bg-surface/70 shadow-[0_24px_90px_-68px_rgba(0,0,0,0.9)] lg:min-h-[720px]">
          {mode === "studio" ? (
            <div className="absolute left-4 top-4 z-10 max-w-[560px] rounded-lg bg-background/70 px-4 py-3 backdrop-blur">
              <h1 className="theme-text-strong text-xl sm:text-2xl">Studio</h1>
              <p className="theme-text-muted mt-1 text-xs sm:text-sm">
                Tune the selected loader, copy the exact source snippet, and use the right-side DialKit controls for deeper props.
              </p>
            </div>
          ) : null}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden p-8 sm:p-10">
            <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:44px_44px]" />
            <div
              className="relative flex items-center justify-center will-change-transform"
              style={previewStyle}
            >
              <ReducedMotionOverrideProvider reducedMotion={false}>
                <SelectedLoader
                  key={`${selectedLoader?.slug}-${controls.pattern}-${controls.dotShape}-${controls.colorPreset}-${controls.customColor}`}
                  {...props}
                />
              </ReducedMotionOverrideProvider>
            </div>
          </div>
          <div className="shrink-0 px-4 pb-4 lg:absolute lg:left-5 lg:top-24">
            <div className="mx-auto w-full max-w-[520px] rounded-xl border border-border-soft bg-background/72 p-3.5 backdrop-blur">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-fg-dim">Live snippet</p>
                <button
                  type="button"
                  onClick={() => void copySnippet()}
                  aria-label={snippetCopied ? "Copied" : "Copy snippet"}
                  className="inline-flex items-center justify-center rounded-md bg-surface-soft p-1.5 text-fg-strong transition-colors duration-150 ease-out hover:opacity-90"
                >
                  {snippetCopied ? (
                    <CheckIcon className="size-[16px]" />
                  ) : (
                    <CopyClipboardIcon className="size-[16px]" />
                  )}
                </button>
              </div>
              <ShikiCodeView
                code={snippet}
                lang="tsx"
                lineNumbers={false}
                className="text-xs sm:text-[13px] [&_.shiki]:!bg-transparent [&_.shiki]:![background-color:transparent]"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
