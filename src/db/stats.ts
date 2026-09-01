import type { MatchRecord, Player, PlayerStats } from "./types";

/** Wins/losses for one player, computed from an already-fetched match list. */
export function computeStats(matches: MatchRecord[], playerId: string): PlayerStats {
  let wins = 0;
  let losses = 0;
  for (const match of matches) {
    const played = match.player1_id === playerId || match.player2_id === playerId;
    if (!played) continue;
    if (match.winner_id === playerId) wins++;
    else losses++;
  }
  return { wins, losses };
}

export function statsByPlayer(matches: MatchRecord[], players: Player[]): Map<string, PlayerStats> {
  const map = new Map<string, PlayerStats>();
  for (const player of players) map.set(player.id, computeStats(matches, player.id));
  return map;
}
