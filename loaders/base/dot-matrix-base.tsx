"use client";

import { useMemo, type CSSProperties } from "react";

import { cx } from "../core/cx";
import { dmxBloomHaloSpreadClass, dmxBloomRootActive, dmxDotBloomParts } from "../core/dmx-dot-bloom";
import { getMatrix5Layout, resolveDmxBoxOuterDim } from "../core/matrix-layout";
import { remapOpacityToTriplet } from "../core/opacity-triplet";
import { resolveDmxColorTokens } from "../core/color-presets";
import { styleOpacity, stylePx } from "../core/hydration-inline-style";
import {
  distanceFromCenter,
  getPatternIndexes,
  indexToCoord,
  MATRIX_SIZE
} from "../core/patterns";
import { manhattanDistance, normalizedRadius, polarAngle } from "../core/math";
import type { DotAnimationResolver, DotMatrixCommonProps, DotMatrixPhase } from "../types";

interface DotMatrixBaseProps extends DotMatrixCommonProps {
  phase: DotMatrixPhase;
  reducedMotion?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  animationResolver?: DotAnimationResolver;
}

function clamp01(n: number | undefined) {
  if (n == null) {
    return;
  }
  if (!Number.isFinite(n)) {
    return;
  }
  return Math.min(1, Math.max(0, n));
}

function normalizeDmxInlineStyle(style: CSSProperties | undefined): CSSProperties | undefined {
  if (!style) {
    return;
  }
  const normalized = { ...style } as CSSProperties & Record<string, unknown>;
  for (const key of Object.keys(normalized)) {
    if (key.startsWith("--") && typeof normalized[key] === "number") {
      normalized[key] = String(normalized[key]);
    }
  }
  return normalized;
}

export function DotMatrixBase({
  size = 24,
  dotSize = 3,
  color = "currentColor",
  colorPreset,
  speed = 1,
  ariaLabel = "Loading",
  className,
  pattern = "diamond",
  dotShape = "circle",
  muted = false,
  bloom = false,
  halo = 0,
  dotClassName,
  phase,
  reducedMotion = false,
  onMouseEnter,
  onMouseLeave,
  animationResolver,
  opacityBase,
  opacityMid,
  opacityPeak,
  cellPadding,
  boxSize,
  minSize
}: DotMatrixBaseProps) {
  const safeSpeed = speed > 0 ? speed : 1;
  const speedScale = 1 / safeSpeed;
  const { gap, matrixSpan } = getMatrix5Layout(size, dotSize, cellPadding);
  const { outerDim, useWrapper } = resolveDmxBoxOuterDim({ boxSize, minSize });
  const scale = useWrapper && matrixSpan > 0 ? outerDim / matrixSpan : 1;
  const center = Math.floor(MATRIX_SIZE / 2);
  const ob = clamp01(opacityBase);
  const om = clamp01(opacityMid);
  const op = clamp01(opacityPeak);
  const unit = dotSize + gap;
  const { resolvedColor, dotFill } = resolveDmxColorTokens(color, colorPreset);

  const dmxVarStyle = useMemo(() => {
    return {
      width: stylePx(matrixSpan),
      height: stylePx(matrixSpan),
      "--dmx-speed": String(speedScale),
      ["--dmx-dot-size" as const]: `${dotSize}px`,
      ["--dmx-halo-level" as const]: String(halo),
      ["--dmx-dot-fill" as const]: dotFill,
      color: resolvedColor,
      ...(ob !== undefined && { ["--dmx-opacity-base" as const]: String(ob) }),
      ...(om !== undefined && { ["--dmx-opacity-mid" as const]: String(om) }),
      ...(op !== undefined && { ["--dmx-opacity-peak" as const]: String(op) }),
      ...(useWrapper
        ? {
          transform: `scale(${scale})`,
          transformOrigin: "center center" as const
        }
        : {
          minWidth: minSize == null ? undefined : stylePx(minSize),
          minHeight: minSize == null ? undefined : stylePx(minSize)
        })
    } as unknown as CSSProperties;
  }, [matrixSpan, speedScale, dotSize, halo, dotFill, resolvedColor, ob, om, op, useWrapper, scale, minSize]);

  const gridStyle = useMemo(() => ({ gap: stylePx(gap) }), [gap]);

  const activeMask = useMemo(() => {
    const mask = new Array(MATRIX_SIZE * MATRIX_SIZE).fill(false);
    for (const index of getPatternIndexes(pattern)) {
      mask[index] = true;
    }
    return mask;
  }, [pattern]);

  const dotGeometry = useMemo(
    () =>
      Array.from({ length: MATRIX_SIZE * MATRIX_SIZE }, (_, index) => {
        const { row, col } = indexToCoord(index);
        const distance = distanceFromCenter(index);
        const angle = polarAngle(index);
        const radiusNormalizedValue = normalizedRadius(index);
        const manhattan = manhattanDistance(index);
        const deltaX = (col - center) * unit;
        const deltaY = (row - center) * unit;
        const baseStyle = {
          width: stylePx(dotSize),
          height: stylePx(dotSize),
          "--dmx-distance": String(distance),
          "--dmx-row": String(row),
          "--dmx-col": String(col),
          "--dmx-x": `${deltaX}px`,
          "--dmx-y": `${deltaY}px`,
          "--dmx-angle": String(angle),
          "--dmx-radius": String(radiusNormalizedValue),
          "--dmx-manhattan": String(manhattan)
        } as CSSProperties;

        return {
          index,
          row,
          col,
          distance,
          angle,
          radiusNormalizedValue,
          manhattan,
          baseStyle,
          inactiveStyle: {
            ...baseStyle,
            opacity: "0",
            visibility: "hidden" as const,
            pointerEvents: "none" as const,
            animation: "none"
          } as CSSProperties
        };
      }),
    [dotSize, center, unit]
  );

  const dots = dotGeometry.map((dot) => {
    const isActive = activeMask[dot.index];
    const animationState = animationResolver
      ? animationResolver({
        index: dot.index,
        row: dot.row,
        col: dot.col,
        distanceFromCenter: dot.distance,
        angleFromCenter: dot.angle,
        radiusNormalized: dot.radiusNormalizedValue,
        manhattanDistance: dot.manhattan,
        phase,
        isActive,
        reducedMotion
      })
      : undefined;
    const animationStyle = normalizeDmxInlineStyle(animationState?.style);

    let isBloomDot = false;

    const dotStyle = (() => {
      if (!isActive) {
        return dot.inactiveStyle;
      }
      if (animationStyle) {
        const resolvedStyle = { ...animationStyle } as CSSProperties;
        const rawOpacity = resolvedStyle.opacity;
        if (typeof rawOpacity === "number") {
          const remappedOpacity = remapOpacityToTriplet(rawOpacity, ob, om, op);
          resolvedStyle.opacity = String(styleOpacity(remappedOpacity));
          const parts = dmxDotBloomParts(true, rawOpacity, bloom, halo, ob, om, op);
          (resolvedStyle as CSSProperties & { "--dmx-bloom-level"?: string })["--dmx-bloom-level"] = String(styleOpacity(parts.level));
          isBloomDot = parts.bloomDot;
        } else {
          const parts = dmxDotBloomParts(true, 0, bloom, halo, ob, om, op);
          if (parts.level > 0) {
            (resolvedStyle as CSSProperties & { "--dmx-bloom-level"?: string })["--dmx-bloom-level"] = String(styleOpacity(parts.level));
          }
          isBloomDot = parts.bloomDot;
        }
        return { ...dot.baseStyle, ...resolvedStyle } as CSSProperties;
      }
      const parts = dmxDotBloomParts(true, 0, bloom, halo, ob, om, op);
      if (parts.level > 0) {
        isBloomDot = parts.bloomDot;
        return { ...dot.baseStyle, ["--dmx-bloom-level" as const]: String(styleOpacity(parts.level)) } as CSSProperties;
      }
      return dot.baseStyle;
    })();

    return (
      <span
        key={dot.index}
        aria-hidden="true"
        className={cx(
          "dmx-dot",
          !isActive && "dmx-inactive",
          isBloomDot && "dmx-bloom-dot",
          dotClassName,
          animationState?.className
        )}
        style={dotStyle}
      />
    );
  });

  const matrix = (
    <div
      className={cx(
        "dmx-root",
        reducedMotion ? "dmx-motion-reduced" : "dmx-motion-enabled",
        `dmx-dot-shape-${dotShape}`,
        muted && "dmx-muted",
        dmxBloomRootActive(bloom, halo) && "dmx-bloom",
        dmxBloomHaloSpreadClass(halo),
        !useWrapper && className
      )}
      style={dmxVarStyle}
    >
      <div className="dmx-grid" style={gridStyle}>{dots}</div>
    </div>
  );

  if (useWrapper) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={ariaLabel}
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: stylePx(outerDim),
          height: stylePx(outerDim),
          minWidth: minSize == null ? undefined : stylePx(minSize),
          minHeight: minSize == null ? undefined : stylePx(minSize),
          overflow: "hidden"
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {matrix}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      className={cx(
        "dmx-root",
        reducedMotion ? "dmx-motion-reduced" : "dmx-motion-enabled",
        `dmx-dot-shape-${dotShape}`,
        muted && "dmx-muted",
        dmxBloomRootActive(bloom, halo) && "dmx-bloom",
        dmxBloomHaloSpreadClass(halo),
        className
      )}
      style={dmxVarStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="dmx-grid" style={gridStyle}>{dots}</div>
    </div>
  );
}
