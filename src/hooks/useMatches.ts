import { useCallback, useEffect, useState } from "react";
import { listMatches, recordMatch } from "../db/matches";
import type { MatchRecord } from "../db/types";
import type { WinReason } from "../game/types";
import { errorMessage } from "../lib/errorMessage";

export function useMatches(ownerId: string | null) {
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!ownerId) return;
    try {
      setMatches(await listMatches());
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [ownerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submitResult = async (player1Id: string, player2Id: string, winnerId: string, winReason: NonNullable<WinReason>) => {
    if (!ownerId) return;
    try {
      const saved = await recordMatch({ ownerId, player1Id, player2Id, winnerId, winReason });
      setMatches((prev) => [saved, ...prev]);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
      throw err; // let the caller (GameScreen) know the save actually failed
    }
  };

  return { matches, error, submitResult, refresh };
}
