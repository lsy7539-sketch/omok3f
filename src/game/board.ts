// Triangular-lattice board geometry.
//
// The board is shaped like one big triangle made of lattice points:
// row 0 (the apex) has 1 point, row r has (r + 1) points, down to the
// base row (BOARD_ROWS - 1) which has BOARD_ROWS points.
//
// Laid out with equilateral spacing (each row centered under the one
// above), every interior point has exactly 6 neighbors: two in its own
// row, two in the row above, two in the row below. That gives the grid
// exactly 3 straight-line axes (6 directions counting both ways), which
// is what "모든 가능한 직선 방향" is checked against in winRules.ts.

import type { Board, Cell, CellCoord } from "./types";

export const BOARD_ROWS = 11; // rows 0..10 -> 66 points total

export function cellId(row: number, col: number): string {
  return `${row}-${col}`;
}

export function createBoard(): Board {
  const board: Board = [];
  for (let row = 0; row < BOARD_ROWS; row++) {
    const rowCells: Cell[] = [];
    for (let col = 0; col <= row; col++) {
      rowCells.push({ id: cellId(row, col), row, col, stack: [] });
    }
    board.push(rowCells);
  }
  return board;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => ({ ...cell, stack: [...cell.stack] })));
}

export function isValidCoord(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_ROWS && col >= 0 && col <= row;
}

export function getCellAt(board: Board, row: number, col: number): Cell | null {
  if (!isValidCoord(row, col)) return null;
  return board[row][col];
}

export function forEachCell(board: Board, fn: (cell: Cell) => void): void {
  for (const row of board) {
    for (const cell of row) fn(cell);
  }
}

export function allCells(board: Board): Cell[] {
  return board.flat();
}

export function topOwner(cell: Cell) {
  return cell.stack.length > 0 ? cell.stack[cell.stack.length - 1] : null;
}

/**
 * Pixel-space position of a lattice point, used both for rendering and
 * for computing the geometric centre of the board. Row grows downward;
 * each row is horizontally centered under the apex, giving the classic
 * triangular-lattice ("pointy") layout.
 */
export function cellPosition(row: number, col: number, unit = 1) {
  const x = (col - row / 2) * unit;
  const y = row * unit * (Math.sqrt(3) / 2);
  return { x, y };
}

/**
 * The exact centre cell, computed from board geometry rather than a
 * hardcoded guess: the lattice point closest to the centroid of every
 * point on the board. Ties broken by smallest row, then smallest col,
 * so the result is deterministic.
 */
export function getCenterCell(board: Board): Cell {
  const cells = allCells(board);
  let sumX = 0;
  let sumY = 0;
  for (const cell of cells) {
    const { x, y } = cellPosition(cell.row, cell.col);
    sumX += x;
    sumY += y;
  }
  const centroidX = sumX / cells.length;
  const centroidY = sumY / cells.length;

  let best = cells[0];
  let bestDist = Infinity;
  for (const cell of cells) {
    const { x, y } = cellPosition(cell.row, cell.col);
    const dist = (x - centroidX) ** 2 + (y - centroidY) ** 2;
    if (
      dist < bestDist - 1e-9 ||
      (Math.abs(dist - bestDist) <= 1e-9 &&
        (cell.row < best.row || (cell.row === best.row && cell.col < best.col)))
    ) {
      best = cell;
      bestDist = dist;
    }
  }
  return best;
}

export function isCenterCell(board: Board, coord: CellCoord): boolean {
  const center = getCenterCell(board);
  return center.row === coord.row && center.col === coord.col;
}
