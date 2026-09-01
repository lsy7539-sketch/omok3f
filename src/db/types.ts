import type { WinReason } from "../game/types";

export interface Player {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
}

export interface MatchRecord {
  id: string;
  owner_id: string;
  player1_id: string;
  player2_id: string;
  winner_id: string;
  win_reason: NonNullable<WinReason>;
  played_at: string;
}

export interface PlayerStats {
  wins: number;
  losses: number;
}
