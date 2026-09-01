import { useMemo } from "react";
import { allCells, cellPosition, getCenterCell } from "../game/board";
import { LATTICE_AXES } from "../game/neighbors";
import { canPlaceInSetup } from "../game/setupRules";
import type { CellCoord, GameState } from "../game/types";
import Cell from "./Cell";

const UNIT = 60;
const PADDING = UNIT * 1.15;

interface BoardProps {
  state: GameState;
  validMoveTargets: CellCoord[];
  onCellClick: (row: number, col: number) => void;
}

export default function Board({ state, validMoveTargets, onCellClick }: BoardProps) {
  const { board, phase, currentPlayer, selectedStone, winningCells } = state;

  const cells = useMemo(() => allCells(board), [board]);
  const center = useMemo(() => getCenterCell(board), [board]);

  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    for (const cell of cells) map.set(cell.id, cellPosition(cell.row, cell.col, UNIT));
    return map;
  }, [cells]);

  const bounds = useMemo(() => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const { x, y } of positions.values()) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    return {
      minX: minX - PADDING,
      minY: minY - PADDING,
      width: maxX - minX + PADDING * 2,
      height: maxY - minY + PADDING * 2,
    };
  }, [positions]);

  const edges = useMemo(() => {
    const lines: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    for (const cell of cells) {
      for (const [dr, dc] of LATTICE_AXES) {
        const neighbor = board[cell.row + dr]?.[cell.col + dc];
        if (!neighbor) continue;
        const a = positions.get(cell.id)!;
        const b = positions.get(neighbor.id)!;
        lines.push({ key: `${cell.id}_${neighbor.id}`, x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      }
    }
    return lines;
  }, [cells, board, positions]);

  const winningSet = useMemo(() => new Set(winningCells.map((c) => `${c.row}-${c.col}`)), [winningCells]);
  const validMoveSet = useMemo(() => new Set(validMoveTargets.map((c) => `${c.row}-${c.col}`)), [validMoveTargets]);

  const isGameOver = phase === "GAME_OVER";

  return (
    <div className="board-frame">
      <svg
        viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
        role="group"
        aria-label="3층오목 게임판"
      >
        <g className="board-edges">
          {edges.map((e) => (
            <line key={e.key} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} />
          ))}
        </g>
        <g className="board-cells">
          {cells.map((cell) => {
            const pos = positions.get(cell.id)!;
            const isCenter = cell.row === center.row && cell.col === center.col;
            const isSelected = selectedStone?.row === cell.row && selectedStone?.col === cell.col;
            const isValidMove = validMoveSet.has(cell.id);
            const isWinning = winningSet.has(cell.id);
            const setupBlocked =
              phase === "SETUP" &&
              cell.stack.length === 0 &&
              !canPlaceInSetup(board, cell.row, cell.col, currentPlayer);

            return (
              <Cell
                key={cell.id}
                cell={cell}
                x={pos.x}
                y={pos.y}
                unit={UNIT}
                isCenter={isCenter}
                isSelected={isSelected}
                isValidMove={isValidMove}
                isWinning={isWinning}
                disabled={isGameOver || setupBlocked}
                onClick={() => onCellClick(cell.row, cell.col)}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
