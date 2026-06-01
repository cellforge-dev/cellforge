"use client";

import { useMemo } from "react";

import { CellForgeBase } from "@/components/ui/cellforge-core";
import { useCellForgePhases } from "@/components/ui/cellforge-hooks";
import { isWithinCircularMask } from "@/components/ui/cellforge-core";
import { useCyclePhase } from "@/components/ui/cellforge-hooks";
import { usePrefersReducedMotion } from "@/components/ui/cellforge-hooks";
import type { DotAnimationResolver, CellForgeCommonProps } from "@/components/ui/cellforge-core";

export type CellOrbit18Props = CellForgeCommonProps;

const BASE_OPACITY = 0.07;
const MID_OPACITY = 0.33;
const HIGH_OPACITY = 0.95;

export function CellOrbit18({
  speed = 1,
  animated = true,
  hoverAnimated = false,
  ...rest
}: CellOrbit18Props) {
  const reducedMotion = usePrefersReducedMotion();
  const { phase: matrixPhase, onMouseEnter, onMouseLeave } = useCellForgePhases({
    animated: Boolean(animated && !reducedMotion),
    hoverAnimated: Boolean(hoverAnimated && !reducedMotion),
    speed
  });
  const animPhase = useCyclePhase({
    active: !reducedMotion && matrixPhase !== "idle",
    cycleMsBase: 1550,
    speed
  });

  const resolver = useMemo<DotAnimationResolver>(() => {
    return ({ row, col, phase }) => {
      if (!isWithinCircularMask(row, col)) {
        return { className: "dmx-inactive" };
      }

      const t = reducedMotion || phase === "idle" ? 0 : Math.floor((animPhase) * 6);
      const pulseRow = t % 3; // 0..2
      const topRow = pulseRow;
      const bottomRow = 4 - pulseRow;
      const pairCols = [1, 3];

      let opacity = BASE_OPACITY;
      if ((row === topRow || row === bottomRow) && pairCols.includes(col)) {
        opacity = HIGH_OPACITY;
      } else if ((row === topRow || row === bottomRow) && col === 2) {
        opacity = 0.58;
      } else if ((row === 2 || col === 2) && pairCols.includes(col) === false) {
        opacity = MID_OPACITY;
      } else if (pairCols.includes(col)) {
        opacity = 0.22;
      }

      return { style: { opacity } };
    };
  }, [reducedMotion, animPhase]);

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
