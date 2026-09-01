import { useEffect, useRef, useState } from "react";
import { useGame } from "../hooks/useGame";
import Board from "./Board";
import PlayerPanel from "./PlayerPanel";
import GameStatus from "./GameStatus";
import RulesModal from "./RulesModal";
import VictoryModal from "./VictoryModal";
import type { Player } from "../db/types";
import type { WinReason } from "../game/types";

type RecordStatus = "saving" | "saved" | "error" | null;

interface GameScreenProps {
  p1: Player;
  p2: Player;
  onExitMatch: () => void;
  onRecordWin: (p1Id: string, p2Id: string, winnerId: string, winReason: NonNullable<WinReason>) => Promise<void> | void;
}

export default function GameScreen({ p1, p2, onExitMatch, onRecordWin }: GameScreenProps) {
  const { state, handleCellClick, reset, validMoveTargets } = useGame();
  const [rulesOpen, setRulesOpen] = useState(false);
  const [recordStatus, setRecordStatus] = useState<RecordStatus>(null);
  const recordedRef = useRef(false);

  useEffect(() => {
    if (state.phase === "GAME_OVER" && state.winner && state.winReason && !recordedRef.current) {
      recordedRef.current = true;
      const winnerId = state.winner === "P1" ? p1.id : p2.id;
      setRecordStatus("saving");
      Promise.resolve(onRecordWin(p1.id, p2.id, winnerId, state.winReason))
        .then(() => setRecordStatus("saved"))
        .catch(() => setRecordStatus("error"));
    }
  }, [state.phase, state.winner, state.winReason, p1.id, p2.id, onRecordWin]);

  const handleRematch = () => {
    recordedRef.current = false;
    setRecordStatus(null);
    reset();
  };

  const winnerName = state.winner === "P1" ? p1.name : state.winner === "P2" ? p2.name : "";

  return (
    <div className="app">
      <header className="app-header">
        <h1>3층오목</h1>
        <p className="app-tagline">
          {p1.name} vs {p2.name}
        </p>
      </header>

      <div className="player-row">
        <PlayerPanel playerId="P1" state={state} displayName={p1.name} />
        <GameStatus state={state} />
        <PlayerPanel playerId="P2" state={state} displayName={p2.name} />
      </div>

      <Board state={state} validMoveTargets={validMoveTargets} onCellClick={handleCellClick} />

      <div className="controls-row">
        <button className="btn-secondary" onClick={() => setRulesOpen(true)}>
          게임 규칙
        </button>
        <button className="btn-secondary" onClick={onExitMatch}>
          상대 바꾸기
        </button>
      </div>

      {rulesOpen && <RulesModal onClose={() => setRulesOpen(false)} />}
      <VictoryModal
        state={state}
        winnerName={winnerName}
        recordStatus={recordStatus}
        onRematch={handleRematch}
        onPickNewMatch={onExitMatch}
      />
    </div>
  );
}
