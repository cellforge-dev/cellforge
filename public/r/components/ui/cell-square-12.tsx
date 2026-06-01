"use client";

import type { CSSProperties } from "react";

import { CellForgeBase } from "@/components/ui/cellforge-core";
import { useCellForgePhases } from "@/components/ui/cellforge-hooks";
import { usePrefersReducedMotion } from "@/components/ui/cellforge-hooks";
import type { DotAnimationResolver, CellForgeCommonProps } from "@/components/ui/cellforge-core";

export type CellSquare12Props = CellForgeCommonProps;

// User-defined origin is cell (2,2) in a 1-based 5x5 grid => (row=1,col=1) in zero-based coords.
const ORIGIN_ROW = 1;
const ORIGIN_COL = 1;
const MAX_MANHATTAN = 6;

const animationResolver: DotAnimationResolver = ({ isActive, row, col, reducedMotion, phase }) => {
  if (!isActive) {
    return { className: "dmx-inactive" };
  }

  const ring = Math.max(
    0,
    Math.min(MAX_MANHATTAN, Math.abs(row - ORIGIN_ROW) + Math.abs(col - ORIGIN_COL))
  );
  const style = {
    "--dmx-center-ripple-ring": ring
  } as CSSProperties;

  if (reducedMotion || phase === "idle") {
    return {
      style: {
        ...style,
        opacity: 0.2 + (1 - ring / MAX_MANHATTAN) * 0.75
      }
    };
  }

  return { className: "dmx-center-origin-ripple", style };
};

export function CellSquare12({
  speed = 1,
  pattern = "full",
  animated = true,
  hoverAnimated = false,
  ...rest
}: CellSquare12Props) {
  const reducedMotion = usePrefersReducedMotion();
  const { phase: matrixPhase, onMouseEnter, onMouseLeave } = useCellForgePhases({
    animated: Boolean(animated && !reducedMotion),
    hoverAnimated: Boolean(hoverAnimated && !reducedMotion),
    speed
  });

  return (
    <CellForgeBase
      {...rest}
      size={rest.size ?? 36}
      dotSize={rest.dotSize ?? 5}
      speed={speed}
      pattern={pattern}
      animated={animated}
      phase={matrixPhase}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      reducedMotion={reducedMotion}
      animationResolver={animationResolver}
    />
  );
}
