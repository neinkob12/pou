// Zusatzbelohnung nach einer Runde, ohne React: Schädlingsschutz über den Health-Slice (P05).
// Münzen und Rekord macht schon finishRound im Gerüst (P08).

import { useGameStore } from '../../../store/gameStore';
import { earnsPestProtection } from './pestSmash';

/** Rückgabe: ob der Schutz vergeben wurde. Dauer: PEST_PROTECTION_REAL_HOURS (Standard im Slice). */
export function grantSmashReward(score: number, nowMs: number = Date.now()): boolean {
  if (!earnsPestProtection(score)) return false;
  useGameStore.getState().protectFromPests(nowMs);
  return true;
}
