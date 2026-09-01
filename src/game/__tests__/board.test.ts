import { describe, expect, it } from "vitest";
import { BOARD_ROWS, allCells, createBoard, getCenterCell, isCenterCell } from "../board";

describe("board geometry", () => {
  it("creates a triangular board with (row+1) cells per row", () => {
    const board = createBoard();
    expect(board).toHaveLength(BOARD_ROWS);
    board.forEach((row, r) => expect(row).toHaveLength(r + 1));
    expect(allCells(board)).toHaveLength((BOARD_ROWS * (BOARD_ROWS + 1)) / 2);
  });

  it("computes a single deterministic centre cell", () => {
    const board = createBoard();
    const center = getCenterCell(board);
    // Geometric centroid of the 11-row triangle sits exactly between
    // (6,3), (7,3) and (7,4); the smallest-row/then-smallest-col
    // tiebreak must resolve to (6,3).
    expect(center).toMatchObject({ row: 6, col: 3 });
    expect(isCenterCell(board, { row: 6, col: 3 })).toBe(true);
    expect(isCenterCell(board, { row: 7, col: 3 })).toBe(false);
  });
});
