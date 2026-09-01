import { useState } from "react";
import { useGame } from "./hooks/useGame";
import Board from "./components/Board";
import PlayerPanel from "./components/PlayerPanel";
import GameStatus from "./components/GameStatus";
import RulesModal from "./components/RulesModal";
import VictoryModal from "./components/VictoryModal";

export default function App() {
  const { state, handleCellClick, reset, validMoveTargets } = useGame();
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <h1>3층오목</h1>
        <p className="app-tagline">삼각 격자 위에 돌을 쌓아 세 가지 방법 중 하나로 승리하는 전략 게임</p>
      </header>

      <div className="player-row">
        <PlayerPanel playerId="P1" state={state} />
        <GameStatus state={state} />
        <PlayerPanel playerId="P2" state={state} />
      </div>

      <Board state={state} validMoveTargets={validMoveTargets} onCellClick={handleCellClick} />

      <div className="controls-row">
        <button className="btn-secondary" onClick={() => setRulesOpen(true)}>
          게임 규칙
        </button>
        <button className="btn-primary" onClick={reset}>
          다시하기
        </button>
      </div>

      {rulesOpen && <RulesModal onClose={() => setRulesOpen(false)} />}
      <VictoryModal state={state} onRestart={reset} />
    </div>
  );
}
