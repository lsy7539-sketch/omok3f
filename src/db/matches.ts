import { supabase } from "../lib/supabaseClient";
import type { MatchRecord } from "./types";
import type { WinReason } from "../game/types";

export async function listMatches(limit = 200): Promise<MatchRecord[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("played_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function recordMatch(params: {
  ownerId: string;
  player1Id: string;
  player2Id: string;
  winnerId: string;
  winReason: NonNullable<WinReason>;
}): Promise<MatchRecord> {
  const { data, error } = await supabase
    .from("matches")
    .insert({
      owner_id: params.ownerId,
      player1_id: params.player1Id,
      player2_id: params.player2Id,
      winner_id: params.winnerId,
      win_reason: params.winReason,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
