"use client";

import { useMemo, type CSSProperties } from "react";

import { CellForgeBase } from "@/components/ui/cellforge-core";
import { useCellForgePhases } from "@/components/ui/cellforge-hooks";
import { usePrefersReducedMotion } from "@/components/ui/cellforge-hooks";
import type { DotAnimationResolver, CellForgeCommonProps } from "@/components/ui/cellforge-core";

export type CellSquare6Props = CellForgeCommonProps;

const COLUMN_HEIGHT = 5;

export function CellSquare6({
  speed = 1,
  pattern = "full",
  animated = true,
  hoverAnimated = false,
  ...rest
}: CellSquare6Props) {
  const reducedMotion = usePrefersReducedMotion();
  const { phase: matrixPhase, onMouseEnter, onMouseLeave } = useCellForgePhases({
    animated: Boolean(animated && !reducedMotion),
    hoverAnimated: Boolean(hoverAnimated && !reducedMotion),
    speed
  });

  const animationResolver = useMemo<DotAnimationResolver>(() => {
    return ({ isActive, row, col, phase }) => {
      if (!isActive) {
        return { className: "dmx-inactive" };
      }

      const goesUp = col % 2 === 0;
      const position = goesUp ? COLUMN_HEIGHT - 1 - row : row;

      if (reducedMotion || phase === "idle") {
        return { style: { opacity: 0.22 + (position / (COLUMN_HEIGHT - 1)) * 0.66 } };
      }

      return {
        className: "dmx-square6-col-snake",
        style: { "--dmx-col-pos": position } as CSSProperties
      };
    };
  }, [reducedMotion]);

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
