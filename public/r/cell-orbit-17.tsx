"use client";

import { useMemo } from "react";

import { CellForgeBase } from "@/components/ui/cellforge-core";
import { useCellForgePhases } from "@/components/ui/cellforge-hooks";
import { isWithinCircularMask } from "@/components/ui/cellforge-core";
import { useCyclePhase } from "@/components/ui/cellforge-hooks";
import { usePrefersReducedMotion } from "@/components/ui/cellforge-hooks";
import type { DotAnimationResolver, CellForgeCommonProps } from "@/components/ui/cellforge-core";

export type CellOrbit17Props = CellForgeCommonProps;

const BASE_OPACITY = 0.07;
const MID_OPACITY = 0.34;
const HIGH_OPACITY = 0.95;
/** Discrete checker frames per loop (must stay integer for `(row + col + t) % 2`). */
const CHECKER_STEPS = 4;

export function CellOrbit17({
  speed = 1,
  animated = true,
  hoverAnimated = false,
  ...rest
}: CellOrbit17Props) {
  const reducedMotion = usePrefersReducedMotion();
  const { phase: matrixPhase, onMouseEnter, onMouseLeave } = useCellForgePhases({
    animated: Boolean(animated && !reducedMotion),
    hoverAnimated: Boolean(hoverAnimated && !reducedMotion),
    speed
  });
  const animPhase = useCyclePhase({
    active: !reducedMotion && matrixPhase !== "idle",
    cycleMsBase: 1500,
    speed
  });

  const resolver = useMemo<DotAnimationResolver>(() => {
    return ({ row, col, phase: dmxPhase }) => {
      if (!isWithinCircularMask(row, col)) {
        return { className: "dmx-inactive" };
      }

      const holdStill = reducedMotion || dmxPhase === "idle";
      const t = holdStill
        ? 0
        : Math.floor(animPhase * CHECKER_STEPS) % CHECKER_STEPS;
      const parity = (row + col + t) % 2;
      const brailleBias = col === 1 || col === 3;
      const centerBias = row === 2 || col === 2;

      let opacity = BASE_OPACITY;
      if (parity === 0 && brailleBias) {
        opacity = HIGH_OPACITY;
      } else if (parity === 0 || centerBias) {
        opacity = MID_OPACITY;
      } else if (brailleBias) {
        opacity = 0.24;
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
