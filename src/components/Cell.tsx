import type { Cell as CellType } from "../game/types";
import Stone from "./Stone";

interface CellProps {
  cell: CellType;
  x: number;
  y: number;
  unit: number;
  isCenter: boolean;
  isSelected: boolean;
  isValidMove: boolean;
  isWinning: boolean;
  disabled: boolean;
  onClick: () => void;
}

export default function Cell({
  cell,
  x,
  y,
  unit,
  isCenter,
  isSelected,
  isValidMove,
  isWinning,
  disabled,
  onClick,
}: CellProps) {
  const classes = [
    "board-cell",
    isSelected && "is-selected",
    isValidMove && "is-valid-move",
    isWinning && "is-winning",
    disabled && "is-disabled",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <g
      className={classes}
      transform={`translate(${x}, ${y})`}
      onClick={disabled ? undefined : onClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-disabled={disabled}
      aria-label={`${cell.row + 1}행 ${cell.col + 1}열${cell.stack.length ? `, 돌 ${cell.stack.length}층` : ""}`}
    >
      <circle className="hit-area" r={unit * 0.42} />
      {isCenter && cell.stack.length === 0 && <circle className="center-mark" r={unit * 0.045} />}
      {isWinning && <circle className="winning-ring" r={unit * 0.36} />}
      {isSelected && <circle className="selection-ring" r={unit * 0.33} />}
      {cell.stack.length === 0 ? (
        <circle className="lattice-node" r={unit * 0.08} />
      ) : (
        <Stone stack={cell.stack} unit={unit} />
      )}
      {isValidMove && <circle className="move-dot" r={unit * 0.095} />}
    </g>
  );
}
