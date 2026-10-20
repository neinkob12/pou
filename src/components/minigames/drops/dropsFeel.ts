// Feedback von "Tropfen fangen" (Auftrag 40), ohne React: welche Tropfen in einem Schritt im Topf
// gelandet oder unten rausgefallen sind, und wie der Topf beim Fangen federt.

import { DROPS_GAME, MINIGAME_FEEL } from '../../../game/config';
import { clampPot, isOverPot, potTop, type Drop, type DropKind, type DropsField } from './dropsLogic';

export interface VanishedDrop {
  kind: DropKind;
  x: number;
  /** true: im Topf gelandet, false: daneben auf den Boden. */
  caught: boolean;
}

/**
 * Vergleicht zwei Schritte: Tropfen, die fehlen, sind gefangen (über dem Topf an der Öffnung)
 * oder am Boden. Neue Tropfen oben zählen nicht.
 */
export function vanishedDrops(before: DropsField, after: DropsField, height: number): VanishedDrop[] {
  'worklet';
  const out: VanishedDrop[] = [];
  const catchY = potTop(height);
  for (const d of before.drops) {
    if (after.drops.some((n: Drop) => n.id === d.id)) continue;
    const caught = d.y < catchY && isOverPot(d.x, before.potX);
    out.push({ kind: d.kind, x: d.x, caught });
  }
  return out;
}

/** Topf per Tastatur: Richtung -1, 0, 1 mal Tempo, im Feld gehalten. */
export function movePotByKeys(potX: number, axis: number, dtMs: number, width: number): number {
  'worklet';
  if (axis === 0) return potX;
  return clampPot(potX + (axis * MINIGAME_FEEL.keyboardPotSpeed * dtMs) / 1000, width);
}

/** Federn des Topfs nach einem Fang: 1 heißt Ruhe, darunter gestaucht. Dauer in ms. */
export const POT_BOUNCE_MS = 220;

export function potSquash(msSinceCatch: number): number {
  'worklet';
  if (msSinceCatch < 0 || msSinceCatch >= POT_BOUNCE_MS) return 1;
  const t = msSinceCatch / POT_BOUNCE_MS;
  return 1 - 0.18 * Math.sin(t * Math.PI) * (1 - t * 0.5);
}

/** Wo die Tropfen auf dem Boden aufschlagen (y), knapp über dem unteren Rand. */
export function floorY(height: number): number {
  'worklet';
  return height - DROPS_GAME.dropRadius;
}
