"use client";

import { useMemo } from "react";

import { CellForgeBase } from "@/components/ui/cellforge-core";
import { useCellForgePhases } from "@/components/ui/cellforge-hooks";
import { MATRIX_SIZE } from "@/components/ui/cellforge-core";
import { usePrefersReducedMotion } from "@/components/ui/cellforge-hooks";
import { useSteppedCycle } from "@/components/ui/cellforge-hooks";
import type { DotAnimationResolver, CellForgeCommonProps } from "@/components/ui/cellforge-core";

export type CellSquare10Props = CellForgeCommonProps;

const ROWS = MATRIX_SIZE;

const BASE_OPACITY = 0.08;
const PEAK_OPACITY = 1;
const DECAY = 0.72;
const COL_WARP = 0.07;

export function CellSquare10({
  speed = 2.5,
  pattern = "full",
  animated = true,
  hoverAnimated = false,
  ...rest
}: CellSquare10Props) {
  const reducedMotion = usePrefersReducedMotion();
  const { phase: matrixPhase, onMouseEnter, onMouseLeave } = useCellForgePhases({
    animated: Boolean(animated && !reducedMotion),
    hoverAnimated: Boolean(hoverAnimated && !reducedMotion),
    speed
  });
  const scanRow = useSteppedCycle({
    active: !reducedMotion && matrixPhase !== "idle",
    cycleMsBase: 1500,
    steps: ROWS,
    speed,
  });

  const resolver = useMemo<DotAnimationResolver>(() => {
    return ({ isActive, row, col, phase }) => {
      if (!isActive) {
        return { className: "dmx-inactive" };
      }

      if (reducedMotion || phase === "idle") {
        const falloff = (ROWS - 1 - row) / Math.max(1, ROWS - 1);
        return { style: { opacity: BASE_OPACITY + falloff * 0.38 } };
      }

      const colGain = 1 + COL_WARP * Math.sin(col * 1.72 + scanRow * 0.61);

      if (row > scanRow) {
        return { style: { opacity: BASE_OPACITY } };
      }

      const age = scanRow - row;
      const trail = Math.exp(-age * DECAY);
      const opacity = BASE_OPACITY + (PEAK_OPACITY - BASE_OPACITY) * trail * colGain;

      return { style: { opacity: Math.min(PEAK_OPACITY, opacity) } };
    };
  }, [reducedMotion, scanRow]);

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
      animationResolver={resolver}
    />
  );
}
