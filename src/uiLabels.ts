import { STARTING_STONES, type PlayerId, type WinReason } from "./game/types";

export const PLAYER_LABELS: Record<PlayerId, string> = {
  P1: "PLAYER 1",
  P2: "PLAYER 2",
};

export const STARTING_STONES_LABEL = `/${STARTING_STONES}`;

export const WIN_REASON_LABELS: Record<NonNullable<WinReason>, { title: string; icon: string }> = {
  EXACT_FIVE: { title: "정확히 5목 완성", icon: "◆" },
  FIVE_THIRD_FLOOR: { title: "3층 돌 5개 완성", icon: "▲" },
  THREE_CONNECTED_THIRD_FLOOR: { title: "연결된 3층 돌 3개 완성", icon: "⬢" },
};
