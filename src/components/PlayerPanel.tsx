import type { GameState, PlayerId } from "../game/types";
import { PLAYER_LABELS, STARTING_STONES_LABEL } from "../uiLabels";

interface PlayerPanelProps {
  playerId: PlayerId;
  state: GameState;
}

export default function PlayerPanel({ playerId, state }: PlayerPanelProps) {
  const isCurrent = state.currentPlayer === playerId;
  const isActive = isCurrent && state.phase !== "GAME_OVER";
  const isWinner = state.winner === playerId;
  const stonesRemaining = state.players[playerId].stonesRemaining;

  const isSetupActor = state.phase === "SETUP" && isCurrent;
  const step = state.setupSequence[state.setupIndex];
  const remainingInStep = isSetupActor && step ? step.count - state.setupPlacedInStep : 0;

  return (
    <div
      className={[
        "player-panel",
        `player-${playerId.toLowerCase()}`,
        isActive && "is-active",
        isWinner && "is-winner",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="player-heading">
        <span className={`stone-swatch stone-${playerId.toLowerCase()}`} aria-hidden="true" />
        <span className="player-label">{PLAYER_LABELS[playerId]}</span>
      </div>
      <div className="player-stones">
        남은 돌 <span className="stones-count">{stonesRemaining}</span>
        <span className="stones-total">{STARTING_STONES_LABEL}</span>
      </div>
      <div className="player-flag-slot">
        {state.phase === "PLAYING" && isActive && <span className="turn-flag">YOUR TURN</span>}
        {isSetupActor && <span className="setup-flag">돌 {remainingInStep}개 남음</span>}
      </div>
    </div>
  );
}
