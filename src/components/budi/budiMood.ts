// Budis Stimmung und Bewegungswahl ohne React, damit testbar (ART-3): Streichel-Serie (Kitzeln,
// Verliebt), welche Reaktion nach einer Pflege spielt, Einschlafen und Aufwachen, kleine
// Idle-Gesten. Reine Darstellung, keine Spielregel und kein Balancing.

import type { Condition } from '../../game/needs';
import type { BudiReaction } from './budiLook';

/** Streichler mit höchstens so viel Abstand zählen als Serie (Kitzeln). */
export const PET_STREAK_WINDOW_MS = 1500;

export interface PetStreak {
  count: number;
  atMs: number;
}

/** Nächster Stand der Streichel-Serie nach einem Streichler zur Zeit `nowMs`. */
export function nextPetStreak(prev: PetStreak | null, nowMs: number, windowMs = PET_STREAK_WINDOW_MS): PetStreak {
  if (!prev || nowMs - prev.atMs > windowMs || nowMs < prev.atMs) return { count: 1, atMs: nowMs };
  return { count: prev.count + 1, atMs: nowMs };
}

/**
 * Bewegungen nach einer Pflege:
 * wiggle (gestreichelt), tickle (gekitzelt), love (verliebt), gulp (gegossen: schlucken, Freude-Hüpfer),
 * chomp (gedüngt: mampfen, Hüpfer), pout (zu viel: schmollen, Kopfschütteln).
 */
export type ReactionMotion = 'wiggle' | 'tickle' | 'love' | 'gulp' | 'chomp' | 'pout';

export function reactionMotionFor(reaction: BudiReaction | null, tickleAt: number, loveAt: number): ReactionMotion | null {
  if (!reaction || reaction.feedback === 'error') return null;
  if (reaction.feedback === 'warning') return 'pout';
  if (reaction.type === 'water') return 'gulp';
  if (reaction.type !== 'pet') return 'chomp';
  const streak = reaction.streak ?? 1;
  if (streak >= loveAt) return 'love';
  if (streak >= tickleAt) return 'tickle';
  return 'wiggle';
}

export type SleepTransition = 'fallAsleep' | 'wakeUp';

/** Wechsel zwischen Wach und Schlaf; null, wenn sich nichts ändert. */
export function sleepTransition(wasAsleep: boolean, asleep: boolean): SleepTransition | null {
  if (wasAsleep === asleep) return null;
  return asleep ? 'fallAsleep' : 'wakeUp';
}

/** Kleine Gesten, wenn lange nichts passiert: umschauen, Kopf neigen, Freude-Hüpfer. */
export type IdleFidget = 'lookAround' | 'tilt' | 'hop';

const FIDGET_CYCLE: readonly IdleFidget[] = ['lookAround', 'tilt', 'hop', 'lookAround', 'hop', 'tilt'];

/** Die `index`-te Geste. Hüpfen nur, wenn es Budi gut geht; sonst schaut er nur umher. */
export function idleFidget(index: number, condition: Condition | null): IdleFidget {
  const fidget = FIDGET_CYCLE[((index % FIDGET_CYCLE.length) + FIDGET_CYCLE.length) % FIDGET_CYCLE.length];
  if (condition === 'ok' || condition === null) return fidget;
  return fidget === 'hop' ? 'lookAround' : fidget;
}
