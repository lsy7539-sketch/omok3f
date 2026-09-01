// The three win conditions. Each is checked fresh from board state
// after every completed action (never mid-action).

import type { Board, Cell, CellCoord, PlayerId, WinResult } from "./types";
import { allCells, getCellAt, topOwner } from "./board";
import { LATTICE_AXES, getNeighbors } from "./neighbors";

/**
 * Exact-five ("정확히 5개") along any of the 3 lattice axes, judged
 * only by each cell's top-most (visible) stone. A run of 6 or more in
 * a row is explicitly NOT a win, so this walks each *maximal* run and
 * only accepts runs whose length is exactly 5 - never `>= 5`.
 */
export function checkExactFive(board: Board, player: PlayerId): CellCoord[] | null {
  for (const [dr, dc] of LATTICE_AXES) {
    for (const cell of allCells(board)) {
      if (topOwner(cell) !== player) continue;

      // Only start scanning from the beginning of a maximal run, so
      // each run is counted once regardless of its length.
      const prev = getCellAt(board, cell.row - dr, cell.col - dc);
      if (prev && topOwner(prev) === player) continue;

      const run: CellCoord[] = [{ row: cell.row, col: cell.col }];
      let r = cell.row + dr;
      let c = cell.col + dc;
      let next = getCellAt(board, r, c);
      while (next && topOwner(next) === player) {
        run.push({ row: r, col: c });
        r += dr;
        c += dc;
        next = getCellAt(board, r, c);
      }

      if (run.length === 5) return run;
      // run.length > 5 is a 6-in-a-row-or-longer: deliberately skipped,
      // per spec it does not count as a win at all.
    }
  }
  return null;
}

function thirdFloorCellsOf(board: Board, player: PlayerId): Cell[] {
  return allCells(board).filter((cell) => cell.stack.length === 3 && topOwner(cell) === player);
}

/** Five (or more) of your stones sitting on the 3rd floor, anywhere on the board. */
export function checkFiveThirdFloorStones(board: Board, player: PlayerId): CellCoord[] | null {
  const cells = thirdFloorCellsOf(board, player);
  if (cells.length >= 5) return cells.map(({ row, col }) => ({ row, col }));
  return null;
}

/** Three of your 3rd-floor stones forming one connected group (adjacency only). */
export function checkThreeConnectedThirdFloorStones(board: Board, player: PlayerId): CellCoord[] | null {
  const cells = thirdFloorCellsOf(board, player);
  const key = (c: CellCoord) => `${c.row}-${c.col}`;
  const cellSet = new Set(cells.map(key));
  const visited = new Set<string>();

  for (const start of cells) {
    if (visited.has(key(start))) continue;
    const stack: CellCoord[] = [{ row: start.row, col: start.col }];
    const component: CellCoord[] = [];
    visited.add(key(start));

    while (stack.length) {
      const current = stack.pop()!;
      component.push(current);
      for (const neighbor of getNeighbors(board, current.row, current.col)) {
        const nKey = key(neighbor);
        if (cellSet.has(nKey) && !visited.has(nKey)) {
          visited.add(nKey);
          stack.push({ row: neighbor.row, col: neighbor.col });
        }
      }
    }

    if (component.length >= 3) return component;
  }
  return null;
}

export function checkWinner(board: Board, player: PlayerId): WinResult {
  const exactFive = checkExactFive(board, player);
  if (exactFive) return { won: true, reason: "EXACT_FIVE", cells: exactFive };

  const fiveThird = checkFiveThirdFloorStones(board, player);
  if (fiveThird) return { won: true, reason: "FIVE_THIRD_FLOOR", cells: fiveThird };

  const threeConnected = checkThreeConnectedThirdFloorStones(board, player);
  if (threeConnected) return { won: true, reason: "THREE_CONNECTED_THIRD_FLOOR", cells: threeConnected };

  return { won: false, reason: null, cells: [] };
}
