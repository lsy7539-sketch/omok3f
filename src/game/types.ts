// Core data model for 3층오목 (Triple-Floor Omok).
// Kept framework-agnostic so it can be reused by an AI player or a
// networked multiplayer layer later without touching any UI code.

export type PlayerId = "P1" | "P2";

export interface CellCoord {
  row: number;
  col: number;
}

/** A single point on the triangular lattice. Stack index 0 = 1st floor. */
export interface Cell {
  id: string;
  row: number;
  col: number;
  stack: PlayerId[];
}

/** Board is a jagged 2D array: board[row] has (row + 1) cells. */
export type Board = Cell[][];

export type GamePhase = "SETUP" | "PLAYING" | "GAME_OVER";

export interface SetupStep {
  player: PlayerId;
  count: number;
}

export type WinReason =
  | "EXACT_FIVE"
  | "FIVE_THIRD_FLOOR"
  | "THREE_CONNECTED_THIRD_FLOOR"
  | null;

export interface PlayerState {
  stonesRemaining: number;
}

export interface GameState {
  phase: GamePhase;
  currentPlayer: PlayerId;

  players: {
    P1: PlayerState;
    P2: PlayerState;
  };

  board: Board;

  setupSequence: SetupStep[];
  setupIndex: number;
  setupPlacedInStep: number;

  selectedStone: CellCoord | null;

  winner: PlayerId | null;
  winReason: WinReason;
  winningCells: CellCoord[];
}

export interface WinResult {
  won: boolean;
  reason: WinReason;
  cells: CellCoord[];
}

export type GameAction =
  | { type: "PLACE_STONE"; row: number; col: number }
  | { type: "SELECT_STONE"; row: number; col: number }
  | { type: "DESELECT" }
  | { type: "MOVE_STONE"; row: number; col: number }
  | { type: "RESET" };

export const STARTING_STONES = 25;

export function otherPlayer(player: PlayerId): PlayerId {
  return player === "P1" ? "P2" : "P1";
}
