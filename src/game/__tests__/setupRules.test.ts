import { describe, expect, it } from "vitest";
import { createBoard, getCenterCell } from "../board";
import { canPlaceInSetup } from "../setupRules";
import { createInitialState, reduceGame } from "../gameEngine";

describe("setup placement restrictions", () => {
  it("blocks the exact centre cell", () => {
    const board = createBoard();
    const center = getCenterCell(board);
    expect(canPlaceInSetup(board, center.row, center.col, "P1")).toBe(false);
    expect(canPlaceInSetup(board, center.row, center.col, "P2")).toBe(false);
  });

  it("blocks a cell adjacent to the same player's own stone, but allows the opponent there", () => {
    const board = createBoard();
    board[2][1].stack = ["P1"];

    // (2,0) is adjacent to (2,1).
    expect(canPlaceInSetup(board, 2, 0, "P1")).toBe(false);
    expect(canPlaceInSetup(board, 2, 0, "P2")).toBe(true);
  });

  it("allows placement on an empty, non-centre, non-adjacent cell", () => {
    const board = createBoard();
    board[2][1].stack = ["P1"];
    expect(canPlaceInSetup(board, 5, 2, "P1")).toBe(true);
  });

  it("rejects placing onto an already-occupied cell (no stacking during setup)", () => {
    const board = createBoard();
    board[4][2].stack = ["P2"];
    expect(canPlaceInSetup(board, 4, 2, "P1")).toBe(false);
  });

  it("runs the full 1 -> 2 -> 2 -> 1 sequence and hands off to P1 for normal play", () => {
    let state = createInitialState();
    expect(state.currentPlayer).toBe("P1");

    // Step 1: P1 places 1.
    state = reduceGame(state, { type: "PLACE_STONE", row: 1, col: 0 });
    expect(state.phase).toBe("SETUP");
    expect(state.currentPlayer).toBe("P2");
    expect(state.players.P1.stonesRemaining).toBe(24);

    // Step 2: P2 places 2, turn only changes after both are placed.
    state = reduceGame(state, { type: "PLACE_STONE", row: 1, col: 1 });
    expect(state.currentPlayer).toBe("P2");
    state = reduceGame(state, { type: "PLACE_STONE", row: 3, col: 0 });
    expect(state.currentPlayer).toBe("P1");
    expect(state.players.P2.stonesRemaining).toBe(23);

    // Step 3: P1 places 2. (5,3) and (7,1) are not adjacent to each
    // other or to P1's earlier stone at (1,0).
    state = reduceGame(state, { type: "PLACE_STONE", row: 5, col: 3 });
    expect(state.currentPlayer).toBe("P1");
    state = reduceGame(state, { type: "PLACE_STONE", row: 7, col: 1 });
    expect(state.currentPlayer).toBe("P2");
    expect(state.players.P1.stonesRemaining).toBe(22);

    // Step 4: P2 places 1 -> setup complete, P1 starts normal play.
    state = reduceGame(state, { type: "PLACE_STONE", row: 9, col: 5 });
    expect(state.phase).toBe("PLAYING");
    expect(state.currentPlayer).toBe("P1");
    expect(state.players.P2.stonesRemaining).toBe(22);

    const placedStones = state.board.flat().filter((c) => c.stack.length > 0);
    expect(placedStones).toHaveLength(6);
  });

  it("also blocks the 2nd stone of a 2-stone step from landing next to the 1st", () => {
    let state = createInitialState();
    state = reduceGame(state, { type: "PLACE_STONE", row: 1, col: 0 }); // P1's single stone
    state = reduceGame(state, { type: "PLACE_STONE", row: 3, col: 1 }); // P2's 1st of 2
    const before = state;
    // (3,2) is adjacent to (3,1), P2's own stone just placed this step.
    state = reduceGame(state, { type: "PLACE_STONE", row: 3, col: 2 });
    expect(state).toBe(before);
  });

  it("ignores an illegal setup placement instead of silently corrupting state", () => {
    let state = createInitialState();
    const center = getCenterCell(state.board);
    const before = state;
    state = reduceGame(state, { type: "PLACE_STONE", row: center.row, col: center.col });
    expect(state).toBe(before);
  });
});
