// Initial placement phase: P1 places 1, P2 places 2, P1 places 2, P2
// places 1 (6 stones total), before normal play begins with P1.

import type { Board, PlayerId, SetupStep } from "./types";
import { getCenterCell } from "./board";
import { getNeighbors } from "./neighbors";
import { topOwner } from "./board";

export const SETUP_SEQUENCE: SetupStep[] = [
  { player: "P1", count: 1 },
  { player: "P2", count: 2 },
  { player: "P1", count: 2 },
  { player: "P2", count: 1 },
];

/**
 * Setup placement is legal only into an empty cell, never the exact
 * board centre, and never adjacent to that same player's own existing
 * stone (adjacency to the *opponent's* stones is fine).
 */
export function canPlaceInSetup(board: Board, row: number, col: number, player: PlayerId): boolean {
  const cell = board[row]?.[col];
  if (!cell) return false;
  if (cell.stack.length > 0) return false;

  const center = getCenterCell(board);
  if (center.row === row && center.col === col) return false;

  const neighbors = getNeighbors(board, row, col);
  const adjacentToOwnStone = neighbors.some((n) => topOwner(n) === player);
  if (adjacentToOwnStone) return false;

  return true;
}
