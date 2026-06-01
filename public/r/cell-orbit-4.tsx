"use client";

import { useMemo } from "react";

import { CellForgeBase } from "@/components/ui/cellforge-core";
import { useCellForgePhases } from "@/components/ui/cellforge-hooks";
import { isWithinCircularMask } from "@/components/ui/cellforge-core";
import { useCyclePhase } from "@/components/ui/cellforge-hooks";
import { usePrefersReducedMotion } from "@/components/ui/cellforge-hooks";
import type { DotAnimationResolver, CellForgeCommonProps } from "@/components/ui/cellforge-core";

export type CellOrbit4Props = CellForgeCommonProps;

const BASE_OPACITY = 0.08;
const SWEEP_OPACITY = 0.96;
const NEAR_SWEEP_OPACITY = 0.36;
const RING_OPACITY = 0.22;

export function CellOrbit4({
  speed = 1.55,
  animated = true,
  hoverAnimated = false,
  ...rest
}: CellOrbit4Props) {
  const reducedMotion = usePrefersReducedMotion();
  const { phase: matrixPhase, onMouseEnter, onMouseLeave } = useCellForgePhases({
    animated: Boolean(animated && !reducedMotion),
    hoverAnimated: Boolean(hoverAnimated && !reducedMotion),
    speed
  });
  const phase = useCyclePhase({
    active: !reducedMotion && matrixPhase !== "idle",
    cycleMsBase: 1800,
    speed
  });

  const resolver = useMemo<DotAnimationResolver>(() => {
    return ({ row, col, phase: p }) => {
      if (!isWithinCircularMask(row, col)) {
        return { className: "dmx-inactive" };
      }

      const centerRow = row - 2;
      const centerCol = col - 2;
      const radius = Math.hypot(centerRow, centerCol);
      const theta = (reducedMotion || p === "idle" ? 0 : phase) * Math.PI * 2;
      const sweepX = Math.cos(theta);
      const sweepY = Math.sin(theta);
      const projection = centerCol * sweepX + centerRow * sweepY;
      const perpendicular = Math.abs(centerCol * sweepY - centerRow * sweepX);

      if (radius < 0.5) {
        return { style: { opacity: 0.62 } };
      }

      if (projection > 0.3 && perpendicular < 0.55) {
        return { style: { opacity: SWEEP_OPACITY } };
      }

      if (projection > 0 && perpendicular < 1.15) {
        return { style: { opacity: NEAR_SWEEP_OPACITY } };
      }

      if (radius > 1.6 && radius < 2.3) {
        return { style: { opacity: RING_OPACITY } };
      }

      return { style: { opacity: BASE_OPACITY } };
    };
  }, [reducedMotion, phase]);

  return (
    <CellForgeBase
      {...rest}
      size={rest.size ?? 36}
      dotSize={rest.dotSize ?? 5}
      speed={speed}
      pattern="full"
      animated={animated}
      phase={matrixPhase}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      reducedMotion={reducedMotion}
      animationResolver={resolver}
    />
  );
}
