import { describe, expect, it } from "vitest";
import { createInitialState, decideCellClick, reduceGame } from "../gameEngine";
import type { GameState } from "../types";

function toPlaying(): GameState {
  const state = createInitialState();
  return { ...state, phase: "PLAYING", currentPlayer: "P1" };
}

describe("normal play: placing and moving", () => {
  it("places a stone into an empty cell and decrements stone count", () => {
    let state = toPlaying();
    state = reduceGame(state, { type: "PLACE_STONE", row: 5, col: 2 });
    expect(state.board[5][2].stack).toEqual(["P1"]);
    expect(state.players.P1.stonesRemaining).toBe(24);
    expect(state.currentPlayer).toBe("P2");
  });

  it("rejects placing onto an occupied cell", () => {
    let state = toPlaying();
    state.board[5][2].stack = ["P2"];
    const before = state;
    state = reduceGame(state, { type: "PLACE_STONE", row: 5, col: 2 });
    expect(state).toBe(before);
  });

  it("selects then moves a stone, switching turns", () => {
    let state = toPlaying();
    state.board[5][2].stack = ["P1"];
    state = reduceGame(state, { type: "SELECT_STONE", row: 5, col: 2 });
    expect(state.selectedStone).toEqual({ row: 5, col: 2 });

    state = reduceGame(state, { type: "MOVE_STONE", row: 5, col: 3 });
    expect(state.board[5][2].stack).toEqual([]);
    expect(state.board[5][3].stack).toEqual(["P1"]);
    expect(state.currentPlayer).toBe("P2");
    expect(state.selectedStone).toBeNull();
  });

  it("cannot select the opponent's stone", () => {
    let state = toPlaying();
    state.board[5][2].stack = ["P2"];
    state = reduceGame(state, { type: "SELECT_STONE", row: 5, col: 2 });
    expect(state.selectedStone).toBeNull();
  });

  it("clicking the same selected stone again deselects it", () => {
    let state = toPlaying();
    state.board[5][2].stack = ["P1"];
    state = reduceGame(state, { type: "SELECT_STONE", row: 5, col: 2 });
    state = reduceGame(state, { type: "SELECT_STONE", row: 5, col: 2 });
    expect(state.selectedStone).toBeNull();
  });
});

describe("decideCellClick (UI intent resolution)", () => {
  it("always proposes PLACE_STONE during setup", () => {
    const state = createInitialState();
    expect(decideCellClick(state, 3, 1)).toEqual({ type: "PLACE_STONE", row: 3, col: 1 });
  });

  it("proposes SELECT_STONE when clicking your own exposed stone", () => {
    const state = toPlaying();
    state.board[5][2].stack = ["P1"];
    expect(decideCellClick(state, 5, 2)).toEqual({ type: "SELECT_STONE", row: 5, col: 2 });
  });

  it("proposes MOVE_STONE when a stone is selected and the target is a legal destination", () => {
    let state = toPlaying();
    state.board[5][2].stack = ["P1"];
    state = { ...state, selectedStone: { row: 5, col: 2 } };
    expect(decideCellClick(state, 5, 3)).toEqual({ type: "MOVE_STONE", row: 5, col: 3 });
  });

  it("proposes MOVE_STONE even when the destination also holds your own stone (stacking on yourself)", () => {
    let state = toPlaying();
    state.board[5][2].stack = ["P1"]; // selected stone, height 1
    state.board[5][3].stack = ["P1"]; // own stone at a legal, equal-height destination
    state = { ...state, selectedStone: { row: 5, col: 2 } };
    expect(decideCellClick(state, 5, 3)).toEqual({ type: "MOVE_STONE", row: 5, col: 3 });
  });

  it("re-targets selection when clicking a different own stone that is NOT a legal move destination", () => {
    let state = toPlaying();
    state.board[5][2].stack = ["P1"]; // selected, height 1
    state.board[2][1].stack = ["P1"]; // far away, not adjacent
    state = { ...state, selectedStone: { row: 5, col: 2 } };
    expect(decideCellClick(state, 2, 1)).toEqual({ type: "SELECT_STONE", row: 2, col: 1 });
  });

  it("proposes PLACE_STONE for an empty cell with no selection", () => {
    const state = toPlaying();
    expect(decideCellClick(state, 5, 2)).toEqual({ type: "PLACE_STONE", row: 5, col: 2 });
  });
});

describe("simultaneous win resolution", () => {
  it("awards the win to the player who just acted, even if the opponent also qualifies", () => {
    let state = toPlaying();
    // P2 already has 5 height-3 stacks sitting on the board (pre-existing).
    const p2Spots: [number, number][] = [[10, 0], [10, 3], [10, 6], [10, 9], [6, 2]];
    for (const [r, c] of p2Spots) state.board[r][c].stack = ["P1", "P1", "P2"];
    // P1 has 4 in a row already; P1's move about to complete an exact-five.
    for (let col = 0; col <= 3; col++) state.board[9][col].stack = ["P1"];

    state = reduceGame(state, { type: "PLACE_STONE", row: 9, col: 4 });

    expect(state.phase).toBe("GAME_OVER");
    expect(state.winner).toBe("P1");
    expect(state.winReason).toBe("EXACT_FIVE");
  });

  it("awards the win to the opponent if only the opponent's condition is met after the action", () => {
    let state = toPlaying();
    // P2 already satisfies five-third-floor before P1's move; P1's move satisfies nothing.
    const p2Spots: [number, number][] = [[10, 0], [10, 3], [10, 6], [10, 9], [6, 2]];
    for (const [r, c] of p2Spots) state.board[r][c].stack = ["P1", "P1", "P2"];

    state = reduceGame(state, { type: "PLACE_STONE", row: 8, col: 1 });

    expect(state.phase).toBe("GAME_OVER");
    expect(state.winner).toBe("P2");
    expect(state.winReason).toBe("FIVE_THIRD_FLOOR");
  });

  it("locks the board once the game is over: no further placement or movement", () => {
    let state = toPlaying();
    for (let col = 0; col <= 3; col++) state.board[9][col].stack = ["P1"];
    state = reduceGame(state, { type: "PLACE_STONE", row: 9, col: 4 });
    expect(state.phase).toBe("GAME_OVER");

    const before = state;
    state = reduceGame(state, { type: "PLACE_STONE", row: 0, col: 0 });
    expect(state).toBe(before);
  });
});

describe("reset", () => {
  it("returns to a fresh SETUP state from anywhere", () => {
    let state = toPlaying();
    state.board[5][2].stack = ["P1"];
    state = reduceGame(state, { type: "RESET" });
    expect(state.phase).toBe("SETUP");
    expect(state.players.P1.stonesRemaining).toBe(25);
    expect(state.board.flat().every((c) => c.stack.length === 0)).toBe(true);
  });
});
