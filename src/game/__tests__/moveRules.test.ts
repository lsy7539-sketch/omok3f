import { describe, expect, it } from "vitest";
import { createBoard } from "../board";
import { canSelectStone, getValidMoves, moveStone } from "../moveRules";

describe("stone selection", () => {
  it("only lets you select the exposed top stone of your own stack", () => {
    const board = createBoard();
    board[4][2].stack = ["P1", "P2", "P1"]; // top is P1

    expect(canSelectStone(board, 4, 2, "P1")).toBe(true);
    expect(canSelectStone(board, 4, 2, "P2")).toBe(false); // opponent's stone
  });

  it("cannot select a stone buried under others, even if it's yours", () => {
    const board = createBoard();
    board[4][2].stack = ["P1", "P2"]; // P1 is buried at the bottom
    expect(canSelectStone(board, 4, 2, "P1")).toBe(false);
  });
});

describe("valid move destinations", () => {
  it("height 1 source can move to height 0 or 1, not 2", () => {
    const board = createBoard();
    board[5][2].stack = ["P1"]; // source, height 1
    board[5][3].stack = ["P2"]; // neighbor, height 1
    board[4][2].stack = ["P2", "P1"]; // neighbor, height 2
    // (5,1) stays empty -> height 0

    const moves = getValidMoves(board, 5, 2).map((m) => `${m.row}-${m.col}`);
    expect(moves).toContain("5-1"); // height 0
    expect(moves).toContain("5-3"); // height 1
    expect(moves).not.toContain("4-2"); // height 2, too high
  });

  it("height 2 source can move to height 0, 1 or 2, not 3", () => {
    const board = createBoard();
    board[5][2].stack = ["P1", "P1"]; // source, height 2
    board[5][3].stack = ["P2", "P2"]; // neighbor, height 2
    board[4][1].stack = ["P2", "P1", "P2"]; // neighbor, height 3

    const moves = getValidMoves(board, 5, 2).map((m) => `${m.row}-${m.col}`);
    expect(moves).toContain("5-3"); // height 2, equal allowed
    expect(moves).not.toContain("4-1"); // height 3, full
  });

  it("height 3 source can move to height 0, 1 or 2, never onto another height-3 stack", () => {
    const board = createBoard();
    board[5][2].stack = ["P1", "P2", "P1"]; // source, height 3
    board[4][1].stack = ["P2", "P1", "P2"]; // neighbor, height 3

    const moves = getValidMoves(board, 5, 2).map((m) => `${m.row}-${m.col}`);
    expect(moves).not.toContain("4-1");
  });

  it("a low stack cannot move onto a taller stack", () => {
    const board = createBoard();
    board[5][2].stack = ["P1"]; // height 1
    board[4][2].stack = ["P2", "P1"]; // height 2, taller than source
    const moves = getValidMoves(board, 5, 2).map((m) => `${m.row}-${m.col}`);
    expect(moves).not.toContain("4-2");
  });

  it("stacking on top of the opponent is allowed", () => {
    const board = createBoard();
    board[5][2].stack = ["P1"];
    board[5][3].stack = ["P2"];
    const next = moveStone(board, { row: 5, col: 2 }, { row: 5, col: 3 });
    expect(next[5][3].stack).toEqual(["P2", "P1"]);
    expect(next[5][2].stack).toEqual([]);
  });

  it("moving does not mutate the original board (immutability)", () => {
    const board = createBoard();
    board[5][2].stack = ["P1"];
    moveStone(board, { row: 5, col: 2 }, { row: 5, col: 3 });
    expect(board[5][2].stack).toEqual(["P1"]);
    expect(board[5][3].stack).toEqual([]);
  });
});
