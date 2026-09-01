import { useMemo, useReducer } from "react";
import { createInitialState, decideCellClick, reduceGame } from "../game/gameEngine";
import { getValidMoves } from "../game/moveRules";
import { isCenterCell } from "../game/board";
import type { CellCoord } from "../game/types";

export function useGame() {
  const [state, dispatch] = useReducer(reduceGame, undefined, createInitialState);

  const validMoveTargets = useMemo<CellCoord[]>(() => {
    if (state.phase !== "PLAYING" || !state.selectedStone) return [];
    return getValidMoves(state.board, state.selectedStone.row, state.selectedStone.col);
  }, [state.phase, state.selectedStone, state.board]);

  const handleCellClick = (row: number, col: number) => {
    dispatch(decideCellClick(state, row, col));
  };

  const reset = () => dispatch({ type: "RESET" });

  const centerCell = useMemo(() => isCenterCell.bind(null, state.board), [state.board]);

  return { state, handleCellClick, reset, validMoveTargets, centerCell };
}
