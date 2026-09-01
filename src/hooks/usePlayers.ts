import { useCallback, useEffect, useState } from "react";
import { createPlayer, listPlayers } from "../db/players";
import type { Player } from "../db/types";
import { errorMessage } from "../lib/errorMessage";

export function usePlayers(ownerId: string | null) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!ownerId) return;
    setLoading(true);
    try {
      setPlayers(await listPlayers());
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addPlayer = async (name: string) => {
    if (!ownerId) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const player = await createPlayer(ownerId, trimmed);
      setPlayers((prev) => [...prev, player].sort((a, b) => a.name.localeCompare(b.name)));
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return { players, loading, error, addPlayer, refresh };
}
