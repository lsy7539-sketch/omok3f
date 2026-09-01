import { useState } from "react";
import type { Player, PlayerStats } from "../db/types";

interface MatchSetupProps {
  userEmail: string;
  players: Player[];
  stats: Map<string, PlayerStats>;
  loading: boolean;
  error: string | null;
  onAddPlayer: (name: string) => void;
  onStart: (p1: Player, p2: Player) => void;
  onSignOut: () => void;
}

export default function MatchSetup({
  userEmail,
  players,
  stats,
  loading,
  error,
  onAddPlayer,
  onStart,
  onSignOut,
}: MatchSetupProps) {
  const [p1Id, setP1Id] = useState<string | null>(null);
  const [p2Id, setP2Id] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const pick = (id: string) => {
    if (p1Id === id) {
      setP1Id(null);
    } else if (p2Id === id) {
      setP2Id(null);
    } else if (!p1Id) {
      setP1Id(id);
    } else if (!p2Id) {
      setP2Id(id);
    } else {
      setP1Id(id);
      setP2Id(null);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddPlayer(newName);
    setNewName("");
  };

  const canStart = p1Id && p2Id && p1Id !== p2Id;

  const startMatch = () => {
    const p1 = players.find((p) => p.id === p1Id);
    const p2 = players.find((p) => p.id === p2Id);
    if (p1 && p2) onStart(p1, p2);
  };

  return (
    <div className="setup-screen">
      <header className="setup-header">
        <div>
          <h1 className="setup-title">3층오목</h1>
          <p className="setup-user">{userEmail}</p>
        </div>
        <button className="btn-secondary" onClick={onSignOut}>
          로그아웃
        </button>
      </header>

      <section className="setup-section">
        <h2>대국할 두 명을 고르세요</h2>
        <p className="setup-hint">
          {!p1Id ? "Player 1을 선택하세요" : !p2Id ? "Player 2를 선택하세요" : "대국 시작 버튼을 누르세요"}
        </p>

        {error && <p className="auth-error">{error}</p>}

        <ul className="player-roster">
          {loading && players.length === 0 && <li className="roster-empty">불러오는 중...</li>}
          {!loading && players.length === 0 && (
            <li className="roster-empty">아래에서 첫 플레이어를 추가하세요.</li>
          )}
          {players.map((player) => {
            const role = p1Id === player.id ? "p1" : p2Id === player.id ? "p2" : null;
            const s = stats.get(player.id);
            return (
              <li key={player.id}>
                <button
                  type="button"
                  className={`roster-item ${role ? `is-picked-${role}` : ""}`}
                  onClick={() => pick(player.id)}
                >
                  {role && <span className="roster-role">{role === "p1" ? "P1" : "P2"}</span>}
                  <span className="roster-name">{player.name}</span>
                  <span className="roster-record">
                    {s ? `${s.wins}승 ${s.losses}패` : "0승 0패"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <form className="add-player-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="새 플레이어 이름"
            maxLength={20}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit" className="btn-secondary">
            추가
          </button>
        </form>

        <button className="btn-primary start-match" disabled={!canStart} onClick={startMatch}>
          대국 시작
        </button>
      </section>
    </div>
  );
}
