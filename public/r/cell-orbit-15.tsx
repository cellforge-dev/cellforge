"use client";

import { useMemo } from "react";

import { CellForgeBase } from "@/components/ui/cellforge-core";
import { useCellForgePhases } from "@/components/ui/cellforge-hooks";
import { isWithinCircularMask } from "@/components/ui/cellforge-core";
import { useCyclePhase } from "@/components/ui/cellforge-hooks";
import { usePrefersReducedMotion } from "@/components/ui/cellforge-hooks";
import type { DotAnimationResolver, CellForgeCommonProps } from "@/components/ui/cellforge-core";

export type CellOrbit15Props = CellForgeCommonProps;

const BASE_OPACITY = 0.07;
const MID_OPACITY = 0.34;
const HIGH_OPACITY = 0.95;

const BRAILLE_PHASES: ReadonlyArray<ReadonlySet<string>> = [
  new Set(["1,1", "2,1", "3,1", "1,3", "2,3", "3,3"]), // rails
  new Set(["1,1", "2,1", "3,1", "2,2", "1,3", "2,3", "3,3"]), // center bridge
  new Set(["1,1", "1,2", "1,3", "2,1", "2,3", "3,1", "3,2", "3,3"]), // top+bottom bars
  new Set(["1,1", "3,1", "2,2", "1,3", "3,3"]), // X-cross
  new Set(["2,1", "1,2", "3,2", "2,3"]), // plus motif
  new Set(["1,1", "2,1", "2,2", "2,3", "3,3"]) // diagonal sweep
];

export function CellOrbit15({
  speed = 1.65,
  animated = true,
  hoverAnimated = false,
  ...rest
}: CellOrbit15Props) {
  const reducedMotion = usePrefersReducedMotion();
  const { phase: matrixPhase, onMouseEnter, onMouseLeave } = useCellForgePhases({
    animated: Boolean(animated && !reducedMotion),
    hoverAnimated: Boolean(hoverAnimated && !reducedMotion),
    speed
  });
  const animPhase = useCyclePhase({
    active: !reducedMotion && matrixPhase !== "idle",
    cycleMsBase: 1680,
    speed
  });

  const resolver = useMemo<DotAnimationResolver>(() => {
    return ({ row, col, phase }) => {
      if (!isWithinCircularMask(row, col)) {
        return { className: "dmx-inactive" };
      }

      const x = col - 2;
      const y = row - 2;
      const ring = Math.sqrt(x * x + y * y);
      const count = BRAILLE_PHASES.length;
      const phaseIndex =
        reducedMotion || phase === "idle"
          ? 0
          : (() => {
              const t = Number.isFinite(animPhase) ? animPhase : 0;
              const raw = Math.floor(t * count);
              return ((raw % count) + count) % count;
            })();
      const activePattern = BRAILLE_PHASES[phaseIndex]!;
      const key = `${row},${col}`;
      const inPattern = activePattern.has(key);

      const previousIndex = (phaseIndex + BRAILLE_PHASES.length - 1) % BRAILLE_PHASES.length;
      const inPrevPattern = BRAILLE_PHASES[previousIndex]!.has(key);

      let opacity = BASE_OPACITY;
      if (inPattern) {
        opacity = HIGH_OPACITY;
      } else if (inPrevPattern) {
        opacity = MID_OPACITY;
      } else if (ring < 1.1) {
        opacity = 0.2;
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
