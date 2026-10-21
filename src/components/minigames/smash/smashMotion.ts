// Bewegung der Tiere in "Schädlings-Smash" (Auftrag 51), ohne React und ohne Skia, damit testbar.

import { popIn } from '../framework/art/motion';
import type { Critter } from './pestSmash';

const POP_IN_MS = 220;
const SINK_MS = 140;

/** Wie weit ein Tier gerade aus dem Loch schaut (0 drin, 1 ganz draußen). */
export function emergeAt(c: Critter, elapsedMs: number): number {
  'worklet';
  const age = elapsedMs - c.spawnedAtMs;
  if (c.hitAtMs !== null) return 1;
  const left = c.lifetimeMs - age;
  if (left < SINK_MS) return Math.max(0, left / SINK_MS);
  return popIn(Math.min(1, age / POP_IN_MS));
}
