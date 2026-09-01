import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { usePlayers } from "./hooks/usePlayers";
import { useMatches } from "./hooks/useMatches";
import { statsByPlayer } from "./db/stats";
import AuthScreen from "./components/AuthScreen";
import MatchSetup from "./components/MatchSetup";
import GameScreen from "./components/GameScreen";
import type { Player } from "./db/types";

export default function App() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const { players, loading: playersLoading, error: playersError, addPlayer } = usePlayers(user?.id ?? null);
  const { matches, submitResult } = useMatches(user?.id ?? null);
  const [match, setMatch] = useState<{ p1: Player; p2: Player } | null>(null);

  if (loading) {
    return <div className="app-loading">불러오는 중...</div>;
  }

  if (!user) {
    return <AuthScreen onSignIn={signIn} onSignUp={signUp} />;
  }

  if (!match) {
    return (
      <MatchSetup
        userEmail={user.email ?? ""}
        players={players}
        stats={statsByPlayer(matches, players)}
        loading={playersLoading}
        error={playersError}
        onAddPlayer={addPlayer}
        onStart={(p1, p2) => setMatch({ p1, p2 })}
        onSignOut={signOut}
      />
    );
  }

  return (
    <GameScreen
      p1={match.p1}
      p2={match.p2}
      onExitMatch={() => setMatch(null)}
      onRecordWin={(p1Id, p2Id, winnerId, winReason) => submitResult(p1Id, p2Id, winnerId, winReason)}
    />
  );
}
