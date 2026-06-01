"use client";

import { Fragment, useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  LOADER_GALLERY_DEFAULT_DETAIL_DOT_BOOST,
  LOADER_GALLERY_DEFAULT_DETAIL_PREVIEW_SCALE,
  LOADER_GALLERY_DEFAULT_HERO_CONTENT
} from "@/components/loader-gallery-defaults";
import {
  LOADER_GALLERY_EXAMPLE_SNIPPET_PROPS,
  LOADER_GALLERY_EX_OPACITY_FOR_TRIANGLE
} from "@/components/loader-gallery-example-props";
import { LoaderGalleryGridCard } from "@/components/loader-gallery-grid-card";
import type {
  LoaderGalleryProps,
  LoaderPreviewOverrideMap
} from "@/components/loader-gallery.types";
import { LoaderGalleryHeroInstallCommand } from "@/components/loader-gallery-hero-install-command";
import { loaderComponentMap } from "@/lib/loader-component-map";
import { ReducedMotionOverrideProvider } from "@/loaders/hooks/use-prefers-reduced-motion";
import { DotMatrixIcon, type DotMatrixColorPreset, type DotMatrixCommonProps, type DotShape } from "@/loaders";
import { LOADER_GALLERY_PREVIEW_PROPS } from "@/lib/loader-gallery-preview-props";

type ExamplePreviewId = "ex-bloom" | "ex-opacity" | "ex-layout" | "ex-look";

const PREVIEW_TOGGLES: Array<{ id: ExamplePreviewId; label: string; caption: string }> = [
  { id: "ex-bloom", label: "Bloom", caption: "soft halo" },
  { id: "ex-opacity", label: "Trace", caption: "depth fade" },
  { id: "ex-layout", label: "Spacing", caption: "roomier grid" },
  { id: "ex-look", label: "Mark", caption: "cross mask" }
];

const HOMEPAGE_COLOR_PRESETS = [
  { id: "solid-theme", label: "Bone", fill: "var(--color-dot-on)", glow: "var(--color-dot-on)", swatch: "var(--color-dot-on)" },
  { id: "solid-mint", label: "Aqua", fill: "#78d8ca", glow: "#78d8ca", swatch: "#78d8ca" },
  {
    id: "grad-sunset",
    label: "Moss",
    fill: "linear-gradient(135deg, #f2f0ca 0%, #8cc9a4 50%, #244c3e 100%)",
    glow: "#8cc9a4",
    swatch: "linear-gradient(135deg, #f2f0ca 0%, #8cc9a4 50%, #244c3e 100%)"
  },
  {
    id: "grad-ocean",
    label: "Slate",
    fill: "linear-gradient(140deg, #e6eef7 0%, #7897bd 48%, #25344c 100%)",
    glow: "#8da8c8",
    swatch: "linear-gradient(140deg, #e6eef7 0%, #7897bd 48%, #25344c 100%)"
  },
  {
    id: "grad-neon",
    label: "Cedar",
    fill: "linear-gradient(145deg, #ddeaa7 0%, #7fbd74 48%, #2d5f43 100%)",
    glow: "#93c77f",
    swatch: "linear-gradient(145deg, #ddeaa7 0%, #7fbd74 48%, #2d5f43 100%)"
  },
  {
    id: "grad-aurora",
    label: "Iris",
    fill: "linear-gradient(145deg, #eee8f8 0%, #9b8bc2 44%, #3d3658 100%)",
    glow: "#a99bd0",
    swatch: "linear-gradient(145deg, #eee8f8 0%, #9b8bc2 44%, #3d3658 100%)"
  },
  {
    id: "grad-fire",
    label: "Clay",
    fill: "linear-gradient(145deg, #f4d8b5 0%, #c57960 48%, #55302b 100%)",
    glow: "#d28a70",
    swatch: "linear-gradient(145deg, #f4d8b5 0%, #c57960 48%, #55302b 100%)"
  },
  {
    id: "grad-prism",
    label: "Steel",
    fill: "linear-gradient(145deg, #f7f8f8 0%, #a7b0b8 45%, #343a42 100%)",
    glow: "#c1c8cf",
    swatch: "linear-gradient(145deg, #f7f8f8 0%, #a7b0b8 45%, #343a42 100%)"
  }
] as const;

const HOMEPAGE_SHAPE_PRESETS: Array<{ id: DotShape; label: string }> = [
  { id: "circle", label: "Orb" },
  { id: "square", label: "Block" },
  { id: "diamond", label: "Tilt" },
  { id: "pill", label: "Pill" },
  { id: "triangle", label: "Tri" },
  { id: "hex", label: "Hex" },
  { id: "plus", label: "Plus" },
  { id: "star", label: "Star" }
];

function shapeSwatchStyle(shape: DotShape): CSSProperties {
  if (shape === "square") {
    return { borderRadius: 2 };
  }
  if (shape === "diamond") {
    return { borderRadius: 2, transform: "rotate(45deg) scale(0.82)" };
  }
  if (shape === "pill") {
    return { borderRadius: 999, width: 24, height: 12 };
  }
  if (shape === "triangle") {
    return { borderRadius: 0, clipPath: "polygon(50% 0%, 100% 92%, 0% 92%)" };
  }
  if (shape === "hex") {
    return { borderRadius: 0, clipPath: "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0 50%)" };
  }
  if (shape === "plus") {
    return {
      borderRadius: 0,
      clipPath:
        "polygon(36% 0,64% 0,64% 36%,100% 36%,100% 64%,64% 64%,64% 100%,36% 100%,36% 64%,0 64%,0 36%,36% 36%)"
    };
  }
  if (shape === "star") {
    return {
      borderRadius: 0,
      clipPath:
        "polygon(50% 0,61% 34%,98% 35%,68% 56%,79% 91%,50% 70%,21% 91%,32% 56%,2% 35%,39% 34%)"
    };
  }
  return { borderRadius: 999 };
}

function resolvePreviewProps(slug: string, overrides?: LoaderPreviewOverrideMap): DotMatrixCommonProps {
  const base =
    LOADER_GALLERY_PREVIEW_PROPS[slug] ?? LOADER_GALLERY_PREVIEW_PROPS["dotm-square-1"];
  const override = overrides?.[slug];
  return override ? { ...base, ...override } : base;
}

function toCellForgeItemName(slug: string): string {
  return slug
    .replace(/^dotm-square-/, "cell-square-")
    .replace(/^dotm-circular-/, "cell-orbit-")
    .replace(/^dotm-triangle-/, "cell-angle-")
    .replace(/^dotm-hex-/, "cell-lattice-");
}

export function LoaderGallery({
  items,
  heroContent,
  cardAnimationEnabled = true, detailPreviewScale = LOADER_GALLERY_DEFAULT_DETAIL_PREVIEW_SCALE,
  detailPreviewDotBoost = LOADER_GALLERY_DEFAULT_DETAIL_DOT_BOOST,
  previewPropsOverrides,
  className
}: LoaderGalleryProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [activeExampleId, setActiveExampleId] = useState<ExamplePreviewId | null>(null);
  const [activeColorPresetId, setActiveColorPresetId] = useState<string>(HOMEPAGE_COLOR_PRESETS[0].id);
  const [hoveredColorPresetId, setHoveredColorPresetId] = useState<string | null>(null);
  const [activeShape, setActiveShape] = useState<DotShape>("circle");
  const reduceMotion = useReducedMotion();
  const handleSelectSlug = useCallback((slug: string) => {
    setSelectedSlug(slug);
    window.setTimeout(() => {
      document.getElementById(`loader-detail-${slug}`)?.scrollIntoView({
        block: "nearest",
        behavior: "smooth"
      });
    }, 0);
  }, []);
  const resolvedHero = {
    title: heroContent?.title ?? LOADER_GALLERY_DEFAULT_HERO_CONTENT.title,
    description: heroContent?.description ?? LOADER_GALLERY_DEFAULT_HERO_CONTENT.description,
    navLinks: heroContent?.navLinks ?? LOADER_GALLERY_DEFAULT_HERO_CONTENT.navLinks,
    installCommand: heroContent?.installCommand ?? LOADER_GALLERY_DEFAULT_HERO_CONTENT.installCommand
  };
  const firstLoaderSlug = items[0]?.slug ?? "dotm-square-1";

  const selected = useMemo(
    () => items.find((item) => item.slug === selectedSlug) ?? null,
    [items, selectedSlug]
  );
  const activeColorPreset =
    HOMEPAGE_COLOR_PRESETS.find((preset) => preset.id === activeColorPresetId) ?? HOMEPAGE_COLOR_PRESETS[0];
  const stagedItem = selected ?? items[0] ?? null;
  const stagedCommand = stagedItem
    ? `npx shadcn@latest add @cellforge/${toCellForgeItemName(stagedItem.slug)}`
    : resolvedHero.installCommand;

  const toggleExamplePreview = useCallback((id: ExamplePreviewId) => {
    setActiveExampleId((p) => (p === id ? null : id));
  }, []);

  useEffect(() => {
    setActiveExampleId(null);
  }, [selected?.slug]);

  const selectedPreview = useMemo(() => {
    if (!selected) {
      return (
        <ReducedMotionOverrideProvider reducedMotion={false}>
          <DotMatrixIcon />
        </ReducedMotionOverrideProvider>
      );
    }

    const SelectedComponent = loaderComponentMap[selected.slug] ?? DotMatrixIcon;
    const base: DotMatrixCommonProps = {
      ...resolvePreviewProps(selected.slug, previewPropsOverrides),
      colorPreset: activeColorPreset.id as DotMatrixColorPreset,
      dotShape: activeShape
    };
    const detailSize = base.size ?? 30;
    const detailDotSize = base.dotSize ?? 4;
    const largeSize = Math.round(detailSize * detailPreviewScale);
    const largeDotSize = detailDotSize + detailPreviewDotBoost;
    const previewKey = `${selected.slug}-${activeExampleId ?? "default"}`;
    const isSquareMatrix = selected.slug.startsWith("dotm-square-");
    const isTriangleMatrix = selected.slug.startsWith("dotm-triangle-");

    if (activeExampleId) {
      // DotMatrixBase `cellPadding` / `boxSize` only apply to square & circular; triangle
      // uses a 7×7 hand-built grid, so the layout example is not shown in the UI.
      if (activeExampleId === "ex-layout" && isTriangleMatrix) {
        return (
          <ReducedMotionOverrideProvider reducedMotion={false}>
            <SelectedComponent
              key={previewKey}
              {...base}
              size={largeSize}
              dotSize={largeDotSize}
            />
          </ReducedMotionOverrideProvider>
        );
      }
      const snippet: Partial<DotMatrixCommonProps> =
        isTriangleMatrix && activeExampleId === "ex-opacity"
          ? LOADER_GALLERY_EX_OPACITY_FOR_TRIANGLE
          : LOADER_GALLERY_EXAMPLE_SNIPPET_PROPS[activeExampleId];
      const merged: DotMatrixCommonProps = { ...base, ...snippet };
      // Same on-screen scale as the default (large) detail preview, not the snippet’s size/dotSize
      merged.size = largeSize;
      merged.dotSize = largeDotSize;
      // Snippet is about fixed box/slot; left preview should match the default (no `boxSize` frame)
      delete merged.boxSize;
      delete merged.minSize;
      merged.speed = base.speed;
      merged.animated = base.animated;
      // `pattern` only applies to 5×5 square loaders; circular & triangle use fixed silhouttes.
      if (activeExampleId === "ex-look" && isSquareMatrix) {
        merged.pattern = "cross";
      } else {
        merged.pattern = base.pattern;
      }
      return (
        <ReducedMotionOverrideProvider reducedMotion={false}>
          <SelectedComponent
            key={previewKey}
            {...merged}
          />
        </ReducedMotionOverrideProvider>
      );
    }

    return (
      <ReducedMotionOverrideProvider reducedMotion={false}>
        <SelectedComponent
          key={previewKey}
          {...base}
          size={largeSize}
          dotSize={largeDotSize}
        />
      </ReducedMotionOverrideProvider>
    );
  }, [selected, activeExampleId, previewPropsOverrides, detailPreviewScale, detailPreviewDotBoost, activeColorPreset.id, activeShape]);

  return (
    <main
      className={`cf-home-surface relative mx-auto flex min-h-dvh w-full max-w-[1380px] flex-col gap-6 px-4 pb-8 pt-24 sm:px-6 sm:pb-10 sm:pt-26 lg:gap-8 lg:px-8${className ? ` ${className}` : ""}`}
    >
      <section>
        <div className="mt-8 grid gap-6 sm:mt-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
          <div className="flex flex-col gap-6">
            <div className="space-y-3.5">
              <h1 className="theme-text-strong max-w-4xl text-balance text-4xl tracking-tight sm:text-7xl">
                {resolvedHero.title}
              </h1>
              <p className="max-w-[65ch] text-pretty text-sm leading-relaxed tracking-tight text-fg-dim sm:text-2xl">
                {resolvedHero.description}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:max-w-[34rem]">
              <LoaderGalleryHeroInstallCommand installCommand={resolvedHero.installCommand} />
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-border-soft bg-surface/75 p-4 shadow-[0_24px_80px_-56px_rgba(0,0,0,0.78)]">
            <div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-fg-dim">Forge lane</p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-fg-strong">Pick, tune, export.</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
              {["Registry", "Studio", "Source"].map((label, index) => (
                <div key={label} className="rounded-xl border border-border-soft bg-background/45 px-3 py-3">
                  <span className="block font-mono text-fg-dim">0{index + 1}</span>
                  <span className="mt-2 block font-medium text-fg-strong">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                href="/studio"
                className="rounded-lg bg-fg-strong px-4 py-2 text-center text-sm font-semibold text-background transition hover:opacity-85"
              >
                Open Studio
              </Link>
              <Link
                href={`/playground?loader=${encodeURIComponent(firstLoaderSlug)}`}
                className="rounded-lg border border-border-soft px-4 py-2 text-center text-sm font-semibold text-fg-strong transition hover:bg-surface"
              >
                Playground
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-2 rounded-xl border border-border-soft bg-surface/45 p-2 sm:flex-row sm:items-center sm:justify-between">
        <LayoutGroup id="homepage-color-presets">
          <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-border-soft bg-background/35 px-1.5 py-1.5">
            <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-fg-dim">Color</p>
            <div className="flex min-w-0 flex-wrap items-center gap-0.5">
              {HOMEPAGE_COLOR_PRESETS.map((preset) => {
                const active = preset.id === activeColorPreset.id;
                const highlight =
                  hoveredColorPresetId !== null ? hoveredColorPresetId === preset.id : active;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setActiveColorPresetId(preset.id)}
                    onMouseEnter={() => setHoveredColorPresetId(preset.id)}
                    onMouseLeave={() => setHoveredColorPresetId(null)}
                    aria-label={`Use ${preset.label} preset`}
                    aria-pressed={active}
                    title={preset.label}
                    className="relative inline-flex shrink-0 items-center justify-center rounded-md p-1 transition"
                  >
                    {highlight ? (
                      <motion.span
                        layoutId="homepage-color-preset-highlight"
                        className="absolute inset-0 rounded-md bg-preset"
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 520, damping: 38 }
                        }
                      />
                    ) : null}
                    <span
                      className="relative z-10 size-[18px] rounded-full border border-white/25 shadow-[0_0_14px_-9px_currentColor]"
                      style={{ background: preset.swatch }}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </LayoutGroup>
        <div className="flex items-center gap-1.5 rounded-lg border border-border-soft bg-background/35 px-1.5 py-1.5">
          <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-fg-dim">Cell</p>
          <div className="flex min-w-0 flex-wrap items-center gap-0.5">
            {HOMEPAGE_SHAPE_PRESETS.map((shape) => {
              const active = shape.id === activeShape;
              return (
                <button
                  key={shape.id}
                  type="button"
                  onClick={() => setActiveShape(shape.id)}
                  aria-label={`Use ${shape.label} cells`}
                  aria-pressed={active}
                  title={shape.label}
                  className={`inline-flex size-7 shrink-0 items-center justify-center rounded-md border transition ${
                    active
                      ? "border-fg-strong bg-fg-strong text-background"
                      : "border-border-soft bg-surface/70 text-fg-muted hover:bg-surface hover:text-fg-strong"
                  }`}
                >
                  <span
                    className="block size-3.5 bg-current"
                    style={shapeSwatchStyle(shape.id)}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="loader-grid"
        className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6"
      >
        {items.map((item) => {
          const isSelected = item.slug === selectedSlug;
          return (
            <Fragment key={item.slug}>
              <LoaderGalleryGridCard
                item={item}
                onSelect={handleSelectSlug}
                isAnimationEnabled={cardAnimationEnabled}
                isSelected={isSelected}
                PreviewComponent={loaderComponentMap[item.slug] ?? DotMatrixIcon}
                previewProps={{
                  ...resolvePreviewProps(item.slug, previewPropsOverrides),
                  colorPreset: activeColorPreset.id as DotMatrixColorPreset,
                  dotShape: activeShape
                }}
                ignoreReducedMotion
              />
              {isSelected && selected ? (
                <section
                  id={`loader-detail-${item.slug}`}
                  className="col-span-full grid overflow-hidden rounded-xl border border-border-soft bg-surface/80 shadow-[0_24px_80px_-54px_rgba(0,0,0,0.9)] lg:grid-cols-[250px_minmax(0,1fr)_280px]"
                >
                  <div className="border-b border-border-soft p-4 lg:border-b-0 lg:border-r">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-fg-dim">
                      Staged
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-fg-strong">
                      {selected.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-fg-dim">{selected.description}</p>
                    <div className="mt-4 rounded-lg border border-border-soft bg-background/55 px-3 py-2 font-mono text-[11px] text-fg-strong [overflow-wrap:anywhere]">
                      {stagedCommand}
                    </div>
                  </div>

                  <div className="relative grid min-h-[190px] place-items-center border-b border-border-soft bg-background/35 p-7 lg:border-b-0">
                    <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:30px_30px]" />
                    <div className="relative scale-105">{selectedPreview}</div>
                  </div>

                  <div className="p-4 lg:border-l lg:border-border-soft">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-fg-dim">
                      Remix
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {PREVIEW_TOGGLES.map((toggle) => {
                        const active = activeExampleId === toggle.id;
                        return (
                          <button
                            key={toggle.id}
                            type="button"
                            onClick={() => toggleExamplePreview(toggle.id)}
                            className={`rounded-lg border px-2.5 py-2 text-left transition ${
                              active
                                ? "border-fg-strong bg-fg-strong text-background"
                                : "border-border-soft bg-background/45 text-fg-strong hover:bg-surface"
                            }`}
                          >
                            <span className="block text-xs font-semibold">{toggle.label}</span>
                            <span className={`mt-0.5 block text-[10px] ${active ? "text-background/65" : "text-fg-dim"}`}>
                              {toggle.caption}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Link
                        href={`/studio?loader=${encodeURIComponent(selected.slug)}`}
                        className="rounded-lg bg-fg-strong px-3 py-2 text-center text-sm font-semibold text-background transition hover:opacity-85"
                      >
                        Studio
                      </Link>
                      <Link
                        href={`/playground?loader=${encodeURIComponent(selected.slug)}`}
                        className="rounded-lg border border-border-soft px-3 py-2 text-center text-sm font-semibold text-fg-strong transition hover:bg-background/50"
                      >
                        Compare
                      </Link>
                    </div>
                  </div>
                </section>
              ) : null}
            </Fragment>
          );
        })}
      </section>
    </main>
  );
}
