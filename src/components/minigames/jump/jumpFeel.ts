// Spielgefühl von Budi Jump (Auftrag 40), ohne React: Himmel je Höhe, Landung erkennen, Budi
// staucht und streckt sich. Die 'worklet'-Funktionen laufen im Frame-Callback und in Skia-Werten.
// Reihenfolge beachten: Worklets werden im Web nicht vorgezogen, Helfer stehen vor ihrer Nutzung.

import { BUDI_JUMP } from '../../../game/config';
import { colors, gameColors } from '../../../lib/theme';
import type { JumpWorld } from './jumpWorld';

/** Himmel von unten nach oben: Tag, Abend, Nacht. Höhe als Anteil von difficultyHeight. */
const SKY_STOPS: readonly { at: number; top: string; bottom: string }[] = [
  { at: 0, top: gameColors.sky, bottom: colors.cream },
  { at: 0.5, top: colors.lavender, bottom: gameColors.coralLight },
  { at: 1, top: colors.night, bottom: colors.lavender },
];

/** Mischt zwei Farben im Format #RRGGBB, Ergebnis in Großbuchstaben wie in theme.ts. */
export function mixColor(a: string, b: string, t: number): string {
  'worklet';
  const k = Math.min(1, Math.max(0, t));
  let out = '#';
  for (let i = 1; i < 7; i += 2) {
    const va = parseInt(a.slice(i, i + 2), 16);
    const vb = parseInt(b.slice(i, i + 2), 16);
    out += Math.round(va + (vb - va) * k)
      .toString(16)
      .padStart(2, '0');
  }
  return out.toUpperCase();
}

/** Himmelsfarben oben und unten für die Kamera-Höhe. */
export function skyAt(cameraY: number, cfg: typeof BUDI_JUMP = BUDI_JUMP): { top: string; bottom: string } {
  'worklet';
  const h = Math.max(0, cameraY) / cfg.difficultyHeight;
  for (let i = 1; i < SKY_STOPS.length; i += 1) {
    const lo = SKY_STOPS[i - 1];
    const hi = SKY_STOPS[i];
    if (h <= hi.at) {
      const t = (h - lo.at) / (hi.at - lo.at);
      return { top: mixColor(lo.top, hi.top, t), bottom: mixColor(lo.bottom, hi.bottom, t) };
    }
  }
  const last = SKY_STOPS[SKY_STOPS.length - 1];
  return { top: last.top, bottom: last.bottom };
}

/** Wie sichtbar die Sterne sind (0 bis 1): erscheinen ab dem Abend. */
export function starsVisibility(cameraY: number, cfg: typeof BUDI_JUMP = BUDI_JUMP): number {
  'worklet';
  const h = Math.max(0, cameraY) / cfg.difficultyHeight;
  return Math.min(1, Math.max(0, (h - 0.45) / 0.45));
}

export type Landing = 'none' | 'leaf' | 'spring';

/** Ist Budi in diesem Schritt abgesprungen? Schwerkraft senkt vy nur, ein Anstieg heißt Absprung. */
export function landingBetween(before: JumpWorld, next: JumpWorld, cfg: typeof BUDI_JUMP = BUDI_JUMP): Landing {
  'worklet';
  if (next.fallen || next.vy <= before.vy) return 'none';
  return next.vy > cfg.jumpVelocity * 1.2 ? 'spring' : 'leaf';
}

/** Stauchen nach der Landung so lange (ms). */
export const SQUASH_MS = 180;

/** Budis Form: kurz nach der Landung breit und flach, im schnellen Steigen schmal und lang. */
export function budiShape(
  msSinceLanding: number,
  vy: number,
  cfg: typeof BUDI_JUMP = BUDI_JUMP,
): { sx: number; sy: number } {
  'worklet';
  if (msSinceLanding >= 0 && msSinceLanding < SQUASH_MS) {
    const t = msSinceLanding / SQUASH_MS;
    const s = 0.3 * Math.sin(t * Math.PI);
    return { sx: 1 + s, sy: 1 - s };
  }
  const stretch = Math.min(0.15, (Math.abs(vy) / cfg.springVelocity) * 0.15);
  return { sx: 1 - stretch * 0.6, sy: 1 + stretch };
}
