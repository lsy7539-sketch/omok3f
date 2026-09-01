import { describe, expect, it } from "vitest";
import { createBoard } from "../board";
import {
  checkExactFive,
  checkFiveThirdFloorStones,
  checkThreeConnectedThirdFloorStones,
  checkWinner,
} from "../winRules";

describe("exact-five win condition", () => {
  it("recognizes exactly 5 in a row along the horizontal axis", () => {
    const board = createBoard();
    for (let col = 0; col <= 4; col++) board[10][col].stack = ["P1"];
    expect(checkExactFive(board, "P1")).not.toBeNull();
  });

  it("does not win on 4 in a row", () => {
    const board = createBoard();
    for (let col = 0; col <= 3; col++) board[10][col].stack = ["P1"];
    expect(checkExactFive(board, "P1")).toBeNull();
  });

  it("does NOT win on exactly 6 in a row (must be exactly 5, not >= 5)", () => {
    const board = createBoard();
    for (let col = 0; col <= 5; col++) board[10][col].stack = ["P1"];
    expect(checkExactFive(board, "P1")).toBeNull();
  });

  it("does not win on 7 in a row either", () => {
    const board = createBoard();
    for (let col = 0; col <= 6; col++) board[10][col].stack = ["P1"];
    expect(checkExactFive(board, "P1")).toBeNull();
  });

  it("does not count a 5-run that has a same-player stone touching either end (i.e. it's actually part of a 6+ run)", () => {
    const board = createBoard();
    for (let col = 1; col <= 5; col++) board[10][col].stack = ["P1"];
    board[10][6].stack = ["P1"]; // extends the run to 6
    expect(checkExactFive(board, "P1")).toBeNull();
  });

  it("recognizes exactly 5 along a diagonal axis", () => {
    const board = createBoard();
    for (let i = 0; i <= 4; i++) board[i][i].stack = ["P1"]; // axis (1,1)
    expect(checkExactFive(board, "P1")).not.toBeNull();
  });

  it("only counts the top-most stone of each stack, ignoring buried stones", () => {
    const board = createBoard();
    for (let col = 0; col <= 4; col++) board[10][col].stack = ["P1"];
    board[10][2].stack.push("P2"); // P2 now sits on top at column 2, breaking the line
    expect(checkExactFive(board, "P1")).toBeNull();
  });

  it("ignores the other player entirely", () => {
    const board = createBoard();
    for (let col = 0; col <= 4; col++) board[10][col].stack = ["P1"];
    expect(checkExactFive(board, "P2")).toBeNull();
  });
});

describe("five third-floor stones win condition", () => {
  it("wins with 5 scattered height-3 stacks topped by the player", () => {
    const board = createBoard();
    const spots: [number, number][] = [[10, 0], [10, 3], [10, 6], [10, 9], [6, 2]];
    for (const [r, c] of spots) board[r][c].stack = ["P2", "P1", "P1"];
    expect(checkFiveThirdFloorStones(board, "P1")).not.toBeNull();
  });

  it("does not win with only 4", () => {
    const board = createBoard();
    const spots: [number, number][] = [[10, 0], [10, 3], [10, 6], [10, 9]];
    for (const [r, c] of spots) board[r][c].stack = ["P2", "P1", "P1"];
    expect(checkFiveThirdFloorStones(board, "P1")).toBeNull();
  });

  it("does not count a stack of height 3 topped by the opponent", () => {
    const board = createBoard();
    const spots: [number, number][] = [[10, 0], [10, 3], [10, 6], [10, 9], [6, 2]];
    for (const [r, c] of spots) board[r][c].stack = ["P1", "P1", "P2"];
    expect(checkFiveThirdFloorStones(board, "P1")).toBeNull();
  });
});

describe("three connected third-floor stones win condition", () => {
  it("wins when 3 height-3 stacks form one connected group", () => {
    const board = createBoard();
    board[6][3].stack = ["P2", "P1", "P1"];
    board[6][4].stack = ["P2", "P1", "P1"]; // adjacent to (6,3)
    board[7][4].stack = ["P2", "P1", "P1"]; // adjacent to (6,3) too
    expect(checkThreeConnectedThirdFloorStones(board, "P1")).not.toBeNull();
  });

  it("does NOT win when 3 height-3 stacks exist but are not connected", () => {
    const board = createBoard();
    board[2][1].stack = ["P2", "P1", "P1"];
    board[6][3].stack = ["P2", "P1", "P1"];
    board[9][0].stack = ["P2", "P1", "P1"];
    expect(checkThreeConnectedThirdFloorStones(board, "P1")).toBeNull();
  });

  it("does not win with only 2 connected height-3 stacks", () => {
    const board = createBoard();
    board[6][3].stack = ["P2", "P1", "P1"];
    board[6][4].stack = ["P2", "P1", "P1"];
    expect(checkThreeConnectedThirdFloorStones(board, "P1")).toBeNull();
  });
});

describe("checkWinner ordering", () => {
  it("returns not-won when nothing is satisfied", () => {
    const board = createBoard();
    expect(checkWinner(board, "P1").won).toBe(false);
  });
});
