// Regeln von "Tipp den Kreis", ohne React. Die 'worklet'-Funktionen laufen auch im Frame-Callback.

import { TAP_CIRCLE } from '../../../../game/config';

export interface TapCircle {
  x: number;
  y: number;
  /** 0 heißt: noch kein Kreis auf dem Feld. */
  r: number;
  /** Spielzeit (ms), zu der der Kreis erschienen ist. */
  spawnedAtMs: number;
}

export const NO_CIRCLE: TapCircle = { x: 0, y: 0, r: 0, spawnedAtMs: 0 };

/** Kreis wird mit jedem Treffer kleiner, aber nie kleiner als minRadius. */
export function radiusForHits(hits: number, cfg: typeof TAP_CIRCLE = TAP_CIRCLE): number {
  'worklet';
  return Math.max(cfg.minRadius, cfg.startRadius - hits * cfg.shrinkPerHit);
}

/**
 * Setzt einen Kreis komplett ins Feld. `randX`, `randY` sind Zufallszahlen in [0, 1),
 * damit die Funktion testbar bleibt.
 */
export function placeCircle(
  randX: number,
  randY: number,
  width: number,
  height: number,
  r: number,
  spawnedAtMs: number,
): TapCircle {
  'worklet';
  const spanX = Math.max(0, width - 2 * r);
  const spanY = Math.max(0, height - 2 * r);
  return { x: r + randX * spanX, y: r + randY * spanY, r, spawnedAtMs };
}

export function isHit(circle: TapCircle, px: number, py: number, slop: number = TAP_CIRCLE.hitSlop): boolean {
  'worklet';
  if (circle.r <= 0) return false;
  const dx = px - circle.x;
  const dy = py - circle.y;
  const reach = circle.r + slop;
  return dx * dx + dy * dy <= reach * reach;
}

/** Braucht das Feld einen neuen Kreis (keiner da oder zu lange stehen geblieben)? */
export function needsRespawn(circle: TapCircle, elapsedMs: number, lifetimeMs: number = TAP_CIRCLE.lifetimeMs): boolean {
  'worklet';
  return circle.r <= 0 || elapsedMs - circle.spawnedAtMs >= lifetimeMs;
}
