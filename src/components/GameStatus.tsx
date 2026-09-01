import type { GameState } from "../game/types";
import { PLAYER_LABELS } from "../uiLabels";

interface GameStatusProps {
  state: GameState;
}

export default function GameStatus({ state }: GameStatusProps) {
  if (state.phase === "GAME_OVER") {
    return <div className="game-status" />;
  }

  if (state.phase === "SETUP") {
    const step = state.setupSequence[state.setupIndex];
    const remaining = step.count - state.setupPlacedInStep;
    return (
      <div className="game-status">
        <span className="status-eyebrow">기본 배치</span>
        <span className="status-main">
          {PLAYER_LABELS[state.currentPlayer]} · 돌 {remaining}개 놓으세요
        </span>
      </div>
    );
  }

  return (
    <div className="game-status">
      <span className={`status-dot stone-${state.currentPlayer.toLowerCase()}`} aria-hidden="true" />
      <span className="status-main">{PLAYER_LABELS[state.currentPlayer]} 턴</span>
    </div>
  );
}
