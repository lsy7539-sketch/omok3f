// Adjacency for the triangular lattice, resolved purely from board
// coordinates (never from on-screen pixel positions).

import type { Board, Cell, CellCoord } from "./types";
import { getCellAt } from "./board";

/**
 * The 6 lattice directions. Grouped as 3 opposite-pair axes:
 *   axis A: (0,-1) / (0,1)   -> same row
 *   axis B: (-1,-1) / (1,1)  -> diagonal through row above/below, same "side"
 *   axis C: (-1,0) / (1,0)   -> diagonal through row above/below, other side
 * These 3 axes are exactly the straight-line directions win checks scan.
 */
export const LATTICE_DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, -1],
  [0, 1],
  [-1, -1],
  [-1, 0],
  [1, 0],
  [1, 1],
];

/** The 3 axes as single (positive) direction vectors, opposite direction implied. */
export const LATTICE_AXES: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [1, 1],
  [1, 0],
];

export function getNeighborCoords(row: number, col: number): CellCoord[] {
  return LATTICE_DIRECTIONS.map(([dr, dc]) => ({ row: row + dr, col: col + dc }));
}

export function getNeighbors(board: Board, row: number, col: number): Cell[] {
  const neighbors: Cell[] = [];
  for (const [dr, dc] of LATTICE_DIRECTIONS) {
    const cell = getCellAt(board, row + dr, col + dc);
    if (cell) neighbors.push(cell);
  }
  return neighbors;
}

export function isAdjacent(a: CellCoord, b: CellCoord): boolean {
  return LATTICE_DIRECTIONS.some(([dr, dc]) => a.row + dr === b.row && a.col + dc === b.col);
}
