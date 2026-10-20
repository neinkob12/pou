// Steuerung von Budi Jump, ohne React: Neigung oder Tippen wird zur Ziel-Geschwindigkeit.

import { BUDI_JUMP } from '../../../game/config';
import type { JumpConfig } from './jumpWorld';

export type JumpControl = 'tilt' | 'tap';

/**
 * Seitliche Neigung in g, positiv = nach rechts gekippt. iOS meldet die Schwerkraft-Richtung,
 * Android die Gegenkraft, deshalb ist x dort umgekehrt.
 */
export function tiltFromAccelerometer(x: number, os: string): number {
  return os === 'android' ? -x : x;
}

/** Neigung in g zu Geschwindigkeit: Totzone, dann linear bis tiltFullAt, darüber gedeckelt. */
export function speedForTilt(tilt: number, cfg: JumpConfig = BUDI_JUMP): number {
  'worklet';
  const abs = Math.abs(tilt);
  if (abs <= cfg.tiltDeadZone) return 0;
  const share = Math.min(1, (abs - cfg.tiltDeadZone) / (cfg.tiltFullAt - cfg.tiltDeadZone));
  return Math.sign(tilt) * share * cfg.maxSideSpeed;
}

/**
 * Richtung aus den gerade gehaltenen Fingern: linke Hälfte -1, rechte +1. Der zuletzt
 * aufgesetzte Finger (letzter Eintrag) gewinnt. Kein Finger: 0.
 */
export function tapDirection(touchXs: readonly number[], width: number): -1 | 0 | 1 {
  'worklet';
  if (touchXs.length === 0 || width <= 0) return 0;
  return touchXs[touchXs.length - 1] < width / 2 ? -1 : 1;
}
