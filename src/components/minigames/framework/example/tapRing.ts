// Farbe des Zeit-Rings in "Tipp den Kreis" (Auftrag 51), ohne React und ohne Skia, damit testbar.

import { tones } from '../art/palette';

/** Ringfarbe je Restzeit: grün, dann gelb, unter 30 % rot. Gold bleibt gold, bis es knapp wird. */
export function ringColor(left: number, golden: boolean): string {
  'worklet';
  if (left < 0.3) return tones.coral.base;
  if (golden) return tones.gold.base;
  return left < 0.6 ? tones.sun.base : tones.leaf.light;
}
