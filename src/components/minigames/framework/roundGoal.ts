// Ziel einer Runde (Auftrag 45), ohne React: nächste Sterne-Grenze und ob der Rekord gerade fällt.

import { MINIGAME_FEEL } from '../../../game/config';

export interface RoundGoal {
  /** Sterne, die man mit `points` erreicht (1 bis 3); null, wenn schon alle drei geholt sind. */
  nextStars: number | null;
  points: number | null;
}

/** Nächste Sterne-Grenze über dem aktuellen Punktestand. Spiele ohne Grenzen: kein Ziel. */
export function roundGoal(
  gameId: string,
  score: number,
  table: Record<string, readonly [number, number, number]> = MINIGAME_FEEL.stars,
): RoundGoal | null {
  const limits = table[gameId];
  if (!limits) return null;
  const i = limits.findIndex((l) => score < l);
  return i < 0 ? { nextStars: null, points: null } : { nextStars: i + 1, points: limits[i] };
}

/** Schlägt der Punktestand zum ersten Mal in dieser Runde einen alten Rekord (über 0)? */
export function beatsRecord(score: number, recordAtStart: number, alreadyShown: boolean): boolean {
  return !alreadyShown && recordAtStart > 0 && score > recordAtStart;
}
