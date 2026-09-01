import type { GameState } from "../game/types";
import { PLAYER_LABELS, WIN_REASON_LABELS } from "../uiLabels";

interface VictoryModalProps {
  state: GameState;
  onRestart: () => void;
}

export default function VictoryModal({ state, onRestart }: VictoryModalProps) {
  if (state.phase !== "GAME_OVER" || !state.winner || !state.winReason) return null;
  const reason = WIN_REASON_LABELS[state.winReason];

  return (
    <div className="modal-overlay">
      <div
        className={`modal-panel victory-modal player-${state.winner.toLowerCase()}`}
        role="dialog"
        aria-modal="true"
        aria-label="게임 종료"
      >
        <span className={`stone-swatch large stone-${state.winner.toLowerCase()}`} aria-hidden="true" />
        <h2>{PLAYER_LABELS[state.winner]} 승리!</h2>
        <div className="victory-reason">
          <span className="reason-icon" aria-hidden="true">
            {reason.icon}
          </span>
          {reason.title}
        </div>
        <button className="btn-primary" onClick={onRestart}>
          다시하기
        </button>
      </div>
    </div>
  );
}
