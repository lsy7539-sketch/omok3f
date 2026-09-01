import { describe, expect, it } from "vitest";
import { computeStats, statsByPlayer } from "../stats";
import type { MatchRecord, Player } from "../types";

function match(overrides: Partial<MatchRecord>): MatchRecord {
  return {
    id: "m",
    owner_id: "owner",
    player1_id: "a",
    player2_id: "b",
    winner_id: "a",
    win_reason: "EXACT_FIVE",
    played_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("computeStats", () => {
  it("counts wins and losses only for matches the player was in", () => {
    const matches = [
      match({ id: "1", player1_id: "a", player2_id: "b", winner_id: "a" }),
      match({ id: "2", player1_id: "a", player2_id: "c", winner_id: "c" }),
      match({ id: "3", player1_id: "b", player2_id: "c", winner_id: "b" }), // 'a' not involved
    ];
    expect(computeStats(matches, "a")).toEqual({ wins: 1, losses: 1 });
    expect(computeStats(matches, "c")).toEqual({ wins: 1, losses: 1 });
  });

  it("returns zero/zero for a player with no matches", () => {
    expect(computeStats([], "a")).toEqual({ wins: 0, losses: 0 });
  });
});

describe("statsByPlayer", () => {
  it("maps every given player to their own stats", () => {
    const players: Player[] = [
      { id: "a", owner_id: "o", name: "Alice", created_at: "" },
      { id: "b", owner_id: "o", name: "Bob", created_at: "" },
    ];
    const matches = [match({ player1_id: "a", player2_id: "b", winner_id: "a" })];
    const stats = statsByPlayer(matches, players);
    expect(stats.get("a")).toEqual({ wins: 1, losses: 0 });
    expect(stats.get("b")).toEqual({ wins: 0, losses: 1 });
  });
});
