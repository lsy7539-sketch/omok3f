import { supabase } from "../lib/supabaseClient";
import type { Player } from "./types";

export async function listPlayers(): Promise<Player[]> {
  const { data, error } = await supabase.from("players").select("*").order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createPlayer(ownerId: string, name: string): Promise<Player> {
  const { data, error } = await supabase
    .from("players")
    .insert({ owner_id: ownerId, name: name.trim() })
    .select()
    .single();
  if (error) throw error;
  return data;
}
