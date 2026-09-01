import type { GameState } from "../game/types";
import { PLAYER_LABELS, WIN_REASON_LABELS } from "../uiLabels";

interface VictoryModalProps {
  state: GameState;
  winnerName: string;
  recordStatus: "saving" | "saved" | "error" | null;
  onRematch: () => void;
  onPickNewMatch: () => void;
}

export default function VictoryModal({
  state,
  winnerName,
  recordStatus,
  onRematch,
  onPickNewMatch,
}: VictoryModalProps) {
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
        <h2>{winnerName} 승리!</h2>
        <p className="victory-role">{PLAYER_LABELS[state.winner]}</p>
        <div className="victory-reason">
          <span className="reason-icon" aria-hidden="true">
            {reason.icon}
          </span>
          {reason.title}
        </div>

        <p className="record-status">
          {recordStatus === "saving" && "전적 저장 중..."}
          {recordStatus === "saved" && "전적이 저장됐어요."}
          {recordStatus === "error" && "전적 저장에 실패했어요."}
        </p>

        <div className="victory-actions">
          <button className="btn-secondary" onClick={onPickNewMatch}>
            다른 상대 고르기
          </button>
          <button className="btn-primary" onClick={onRematch}>
            다시하기
          </button>
        </div>
      </div>
    </div>
  );
}
