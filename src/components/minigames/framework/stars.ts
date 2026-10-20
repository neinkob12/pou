// Sterne im Ergebnis (Auftrag 40), ohne React: 0 bis 3 je nach Punkten, Grenzen in MINIGAME_FEEL.stars.

import { MINIGAME_FEEL } from '../../../game/config';

export type StarCount = 0 | 1 | 2 | 3;

/** Sterne für eine Runde. Spiele ohne Grenzen bekommen keine Sterne. */
export function starsFor(
  gameId: string,
  score: number,
  table: Record<string, readonly [number, number, number]> = MINIGAME_FEEL.stars,
): StarCount {
  const limits = table[gameId];
  if (!limits || !Number.isFinite(score)) return 0;
  if (score >= limits[2]) return 3;
  if (score >= limits[1]) return 2;
  if (score >= limits[0]) return 1;
  return 0;
}

/** Punkte bis zum nächsten Stern, null wenn schon drei. */
export function pointsToNextStar(
  gameId: string,
  score: number,
  table: Record<string, readonly [number, number, number]> = MINIGAME_FEEL.stars,
): number | null {
  const limits = table[gameId];
  if (!limits) return null;
  const next = limits.find((l) => score < l);
  return next === undefined ? null : next - score;
}
