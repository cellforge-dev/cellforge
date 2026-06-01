"use client";

import { memo, useCallback, type ComponentType, type CSSProperties } from "react";
import type { LoaderCard } from "@/components/loader-details-drawer";
import { ReducedMotionOverrideProvider } from "@/loaders/hooks/use-prefers-reduced-motion";
import type { DotMatrixCommonProps } from "@/loaders";

interface LoaderGalleryGridCardProps {
  item: LoaderCard;
  onSelect: (slug: string) => void;
  isAnimationEnabled: boolean;
  PreviewComponent: ComponentType<DotMatrixCommonProps>;
  previewProps: DotMatrixCommonProps;
  previewStyle?: CSSProperties;
  ignoreReducedMotion?: boolean;
  isSelected?: boolean;
}

export const LoaderGalleryGridCard = memo(function LoaderGalleryGridCard({
  item,
  onSelect,
  isAnimationEnabled,
  PreviewComponent,
  previewProps,
  previewStyle,
  ignoreReducedMotion = false,
  isSelected = false
}: LoaderGalleryGridCardProps) {
  const handleSelect = useCallback(() => {
    onSelect(item.slug);
  }, [onSelect, item.slug]);

  const shouldAnimate = Boolean(isAnimationEnabled && (previewProps.animated ?? true));
  const previewNode = <PreviewComponent {...previewProps} animated={shouldAnimate} />;

  return (
    <button
      type="button"
      onClick={handleSelect}
      aria-pressed={isSelected}
      className={`group relative aspect-square cursor-pointer rounded-2xl border bg-surface/80 transition ${
        isSelected
          ? "border-fg-strong shadow-[0_0_0_1px_var(--color-fg-strong)]"
          : "border-transparent hover:border-border-soft hover:bg-surface"
      }`}
    >
      <div className="theme-text-strong pointer-events-none absolute inset-x-1.5 bottom-1.5 z-20 rounded-md px-1.5 py-1 text-center text-[10px] font-medium tracking-wide">
        {item.title}
      </div>

      <div className="relative flex h-full flex-col">
        <div className="flex flex-1 items-center justify-center " style={previewStyle}>
          {ignoreReducedMotion ? (
            <ReducedMotionOverrideProvider reducedMotion={false}>
              {previewNode}
            </ReducedMotionOverrideProvider>
          ) : previewNode}
        </div>
      </div>
    </button>
  );
});
