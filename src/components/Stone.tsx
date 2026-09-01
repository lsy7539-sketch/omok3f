import type { PlayerId } from "../game/types";

interface StoneProps {
  stack: PlayerId[];
  unit: number;
}

/**
 * Renders a cell's whole stack, bottom stone first. Each higher stone
 * is offset up-and-right so a peek of every lower stone stays visible,
 * making the 3-floor height readable at a glance instead of just a number.
 */
export default function Stone({ stack, unit }: StoneProps) {
  const radius = unit * 0.29;
  const stepX = unit * 0.1;
  const stepY = -unit * 0.15;

  return (
    <g className="stone-stack">
      {stack.map((owner, index) => (
        <circle
          key={index}
          className={`stone stone-${owner.toLowerCase()}`}
          cx={index * stepX}
          cy={index * stepY}
          r={radius}
        />
      ))}
    </g>
  );
}
