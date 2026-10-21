// Neue Elemente von "Tipp den Kreis" (Auftrag 45), ohne React: goldene Knospen und der Endspurt.
// Reihenfolge beachten: Worklets werden im Web nicht vorgezogen, Helfer stehen vor ihrer Nutzung.

import { MINIGAME_FUN, TAP_CIRCLE } from '../../../../game/config';
import { lifetimeAt, type TapCircle } from './tapCircle';

type TapFun = typeof MINIGAME_FUN.tap;

/** Laufen die letzten Sekunden der Runde (Endspurt)? */
export function inFinale(
  elapsedMs: number,
  fun: TapFun = MINIGAME_FUN.tap,
  cfg: typeof TAP_CIRCLE = TAP_CIRCLE,
): boolean {
  'worklet';
  return elapsedMs >= (cfg.durationSeconds - fun.finaleSeconds) * 1000;
}

/** Wird die neue Knospe golden? `rand` in [0, 1). Ganz am Anfang nie, im Endspurt öfter. */
export function rollGolden(rand: number, elapsedMs: number, fun: TapFun = MINIGAME_FUN.tap): boolean {
  'worklet';
  if (elapsedMs < fun.goldenFromMs) return false;
  return rand < (inFinale(elapsedMs, fun) ? fun.finaleGoldenChance : fun.goldenChance);
}

/** Standzeit einer Knospe: goldene verschwinden schneller. */
export function circleLifetime(circle: TapCircle, fun: TapFun = MINIGAME_FUN.tap): number {
  'worklet';
  const base = lifetimeAt(circle.spawnedAtMs);
  return circle.golden ? base * fun.goldenLifetimeFactor : base;
}

/** Punkte für einen Treffer. */
export function pointsForCircle(circle: TapCircle, fun: TapFun = MINIGAME_FUN.tap): number {
  'worklet';
  return circle.golden ? fun.goldenPoints : TAP_CIRCLE.pointsPerHit;
}
