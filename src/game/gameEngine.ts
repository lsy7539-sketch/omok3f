// Orchestrates the pure rule modules into one state machine. This is
// the only place that knows about turn order, phase transitions, and
// simultaneous-win resolution - components and hooks only ever call
// into this file (or read GameState), never board/win/move rules directly
// for anything that mutates state.

import { createBoard } from "./board";
import { SETUP_SEQUENCE, canPlaceInSetup } from "./setupRules";
import { canPlaceStone, canSelectStone, canMoveTo, getValidMoves, moveStone, placeStone } from "./moveRules";
import { checkWinner } from "./winRules";
import {
  otherPlayer,
  STARTING_STONES,
  type GameAction,
  type GameState,
  type PlayerId,
} from "./types";

export function createInitialState(): GameState {
  return {
    phase: "SETUP",
    currentPlayer: SETUP_SEQUENCE[0].player,
    players: {
      P1: { stonesRemaining: STARTING_STONES },
      P2: { stonesRemaining: STARTING_STONES },
    },
    board: createBoard(),
    setupSequence: SETUP_SEQUENCE,
    setupIndex: 0,
    setupPlacedInStep: 0,
    selectedStone: null,
    winner: null,
    winReason: null,
    winningCells: [],
  };
}

/**
 * After any completed action, check both players' win conditions.
 * If both are satisfied simultaneously, the player who just acted wins.
 */
function resolveTurn(state: GameState, actingPlayer: PlayerId): GameState {
  const opponent = otherPlayer(actingPlayer);
  const selfResult = checkWinner(state.board, actingPlayer);
  const oppResult = checkWinner(state.board, opponent);

  if (selfResult.won) {
    return {
      ...state,
      phase: "GAME_OVER",
      winner: actingPlayer,
      winReason: selfResult.reason,
      winningCells: selfResult.cells,
      selectedStone: null,
    };
  }
  if (oppResult.won) {
    return {
      ...state,
      phase: "GAME_OVER",
      winner: opponent,
      winReason: oppResult.reason,
      winningCells: oppResult.cells,
      selectedStone: null,
    };
  }
  return { ...state, currentPlayer: opponent, selectedStone: null };
}

function applySetupPlacement(state: GameState, row: number, col: number): GameState {
  const player = state.currentPlayer;
  if (!canPlaceInSetup(state.board, row, col, player)) return state;

  const board = placeStone(state.board, row, col, player);
  const players = {
    ...state.players,
    [player]: { stonesRemaining: state.players[player].stonesRemaining - 1 },
  };

  const placedInStep = state.setupPlacedInStep + 1;
  const step = state.setupSequence[state.setupIndex];

  if (placedInStep < step.count) {
    return { ...state, board, players, setupPlacedInStep: placedInStep };
  }

  const nextIndex = state.setupIndex + 1;
  if (nextIndex >= state.setupSequence.length) {
    return {
      ...state,
      board,
      players,
      setupIndex: nextIndex,
      setupPlacedInStep: 0,
      phase: "PLAYING",
      currentPlayer: "P1",
    };
  }

  return {
    ...state,
    board,
    players,
    setupIndex: nextIndex,
    setupPlacedInStep: 0,
    currentPlayer: state.setupSequence[nextIndex].player,
  };
}

function applyPlacement(state: GameState, row: number, col: number): GameState {
  const player = state.currentPlayer;
  if (!canPlaceStone(state.board, row, col, state.players[player].stonesRemaining)) return state;

  const board = placeStone(state.board, row, col, player);
  const players = {
    ...state.players,
    [player]: { stonesRemaining: state.players[player].stonesRemaining - 1 },
  };
  return resolveTurn({ ...state, board, players }, player);
}

function applyMove(state: GameState, row: number, col: number): GameState {
  const from = state.selectedStone;
  if (!from) return state;
  if (!canMoveTo(state.board, from, { row, col })) return state;

  const board = moveStone(state.board, from, { row, col });
  return resolveTurn({ ...state, board }, state.currentPlayer);
}

export function reduceGame(state: GameState, action: GameAction): GameState {
  if (action.type === "RESET") return createInitialState();
  if (state.phase === "GAME_OVER") return state;

  switch (action.type) {
    case "PLACE_STONE":
      return state.phase === "SETUP"
        ? applySetupPlacement(state, action.row, action.col)
        : applyPlacement(state, action.row, action.col);
    case "SELECT_STONE": {
      if (state.phase !== "PLAYING") return state;
      if (!canSelectStone(state.board, action.row, action.col, state.currentPlayer)) return state;
      const already = state.selectedStone;
      if (already && already.row === action.row && already.col === action.col) {
        return { ...state, selectedStone: null };
      }
      return { ...state, selectedStone: { row: action.row, col: action.col } };
    }
    case "DESELECT":
      return { ...state, selectedStone: null };
    case "MOVE_STONE":
      return state.phase === "PLAYING" ? applyMove(state, action.row, action.col) : state;
    default:
      return state;
  }
}

/**
 * Decides what a click on (row, col) should mean given current state,
 * so UI components stay dumb: they call this, then dispatch the result.
 */
export function decideCellClick(state: GameState, row: number, col: number): GameAction {
  if (state.phase === "SETUP") {
    return { type: "PLACE_STONE", row, col };
  }
  if (state.phase !== "PLAYING") {
    return { type: "DESELECT" };
  }

  const { selectedStone, board, currentPlayer, players } = state;

  if (selectedStone) {
    if (selectedStone.row === row && selectedStone.col === col) {
      return { type: "DESELECT" };
    }
    // A legal move target wins even when it also holds one of your own
    // stones (stacking onto your own stone is legal, see moveRules) -
    // only a click that ISN'T a valid destination re-targets selection.
    if (getValidMoves(board, selectedStone.row, selectedStone.col).some((m) => m.row === row && m.col === col)) {
      return { type: "MOVE_STONE", row, col };
    }
    if (canSelectStone(board, row, col, currentPlayer)) {
      return { type: "SELECT_STONE", row, col };
    }
    return { type: "DESELECT" };
  }

  if (canSelectStone(board, row, col, currentPlayer)) {
    return { type: "SELECT_STONE", row, col };
  }
  if (canPlaceStone(board, row, col, players[currentPlayer].stonesRemaining)) {
    return { type: "PLACE_STONE", row, col };
  }
  return { type: "DESELECT" };
}
