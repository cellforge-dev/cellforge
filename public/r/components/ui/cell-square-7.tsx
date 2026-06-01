"use client";

import { useMemo } from "react";

import { CellForgeBase } from "@/components/ui/cellforge-core";
import { useCellForgePhases } from "@/components/ui/cellforge-hooks";
import { rowMajorIndex } from "@/components/ui/cellforge-core";
import { usePrefersReducedMotion } from "@/components/ui/cellforge-hooks";
import { useSteppedCycle } from "@/components/ui/cellforge-hooks";
import type { DotAnimationResolver, CellForgeCommonProps } from "@/components/ui/cellforge-core";

export type CellSquare7Props = CellForgeCommonProps;

type FrameCell = "." | "o" | "x" | "c";

const BASE_OPACITY = 0.08;
const SETTLED_OPACITY = 0.42;
const ACTIVE_OPACITY = 1;
const CLEAR_OPACITY = 0.88;
const IDLE_STEP = 10;

const FRAME_MASKS: readonly string[] = [
  "....." + "....." + "....." + "....." + "ooooo",
  "....." + "....." + "....." + "ooooo" + "ooooo",
  "....." + "....." + "ooooo" + "ooooo" + "ooooo",
  "....." + "ooooo" + "ooooo" + "ooooo" + "ooooo",
  "ooooo" + "ooooo" + "ooooo" + "ooooo" + "ooooo",
  "ccccc" + "ccccc" + "ccccc" + "ccccc" + "ccccc",
  "....." + "....." + "....." + "....." + ".....",
  "ccccc" + "ccccc" + "ccccc" + "ccccc" + "ccccc",
  "....." + "....." + "....." + "....." + ".....",
  "....." + "....." + "....." + "....." + "....."
];

const FRAME_SEQUENCE: readonly number[] = [0, 1, 2, 3, 4, 4, 5, 6, 7, 8, 9];

function maskCell(mask: string, row: number, col: number): FrameCell {
  return (mask[rowMajorIndex(row, col)] as FrameCell | undefined) ?? ".";
}

export function CellSquare7({
  speed = 1,
  pattern = "full",
  animated = true,
  hoverAnimated = false,
  ...rest
}: CellSquare7Props) {
  const reducedMotion = usePrefersReducedMotion();
  const { phase: matrixPhase, onMouseEnter, onMouseLeave } = useCellForgePhases({
    animated: Boolean(animated && !reducedMotion),
    hoverAnimated: Boolean(hoverAnimated && !reducedMotion),
    speed
  });
  const sequenceLength = FRAME_SEQUENCE.length;
  const step = useSteppedCycle({
    active: !reducedMotion && matrixPhase !== "idle" && sequenceLength > 0,
    cycleMsBase: 1900,
    steps: sequenceLength,
    speed,
    idleStep: Math.min(IDLE_STEP, sequenceLength - 1)
  });

  const frame = FRAME_SEQUENCE[step] ?? FRAME_SEQUENCE[0] ?? 0;

  const resolver = useMemo<DotAnimationResolver>(() => {
    return ({ isActive, row, col }) => {
      if (!isActive) {
        return { className: "dmx-inactive" };
      }

      const cell = maskCell(FRAME_MASKS[frame]!, row, col);
      if (cell === "x") {
        return { style: { opacity: ACTIVE_OPACITY } };
      }
      if (cell === "o") {
        return { style: { opacity: SETTLED_OPACITY } };
      }
      if (cell === "c") {
        return { style: { opacity: CLEAR_OPACITY } };
      }
      return { style: { opacity: BASE_OPACITY } };
    };
  }, [frame]);

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
