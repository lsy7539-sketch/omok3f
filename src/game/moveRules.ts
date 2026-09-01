// Normal-turn actions: placing a fresh stone into an empty cell, or
// moving the exposed top stone of one of your stacks into an adjacent
// cell (optionally stacking it on top of whatever is already there).

import type { Board, CellCoord, PlayerId } from "./types";
import { cloneBoard, getCellAt, topOwner } from "./board";
import { getNeighbors } from "./neighbors";

export function canPlaceStone(board: Board, row: number, col: number, stonesRemaining: number): boolean {
  const cell = getCellAt(board, row, col);
  if (!cell) return false;
  if (cell.stack.length > 0) return false;
  return stonesRemaining > 0;
}

export function placeStone(board: Board, row: number, col: number, player: PlayerId): Board {
  const next = cloneBoard(board);
  next[row][col].stack.push(player);
  return next;
}

/** Only the exposed top stone of your own stack may be picked up. */
export function canSelectStone(board: Board, row: number, col: number, player: PlayerId): boolean {
  const cell = getCellAt(board, row, col);
  if (!cell || cell.stack.length === 0) return false;
  return topOwner(cell) === player;
}

/**
 * Legal move destinations for the stone currently selected at (row, col):
 * adjacent cells whose height is below 3 and does not exceed the
 * source cell's current height (both measured *before* the move).
 */
export function getValidMoves(board: Board, row: number, col: number): CellCoord[] {
  const source = getCellAt(board, row, col);
  if (!source || source.stack.length === 0) return [];
  const sourceHeight = source.stack.length;

  return getNeighbors(board, row, col)
    .filter((dest) => dest.stack.length < 3 && dest.stack.length <= sourceHeight)
    .map((dest) => ({ row: dest.row, col: dest.col }));
}

export function canMoveTo(board: Board, from: CellCoord, to: CellCoord): boolean {
  return getValidMoves(board, from.row, from.col).some((m) => m.row === to.row && m.col === to.col);
}

export function moveStone(board: Board, from: CellCoord, to: CellCoord): Board {
  const next = cloneBoard(board);
  const stone = next[from.row][from.col].stack.pop();
  if (stone) next[to.row][to.col].stack.push(stone);
  return next;
}
