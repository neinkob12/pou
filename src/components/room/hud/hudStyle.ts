// Look der Zimmer-Leisten (ART-4) auf den Spiel-Tokens von ART-1 (theme.ts): dicke Kontur, Kante
// unten, Verlauf mit Glanz, kräftige Farbe je Bedürfnis. Nur Darstellung, keine Spielwerte.

import { depth, outline, tones, type Tone } from '../../../lib/theme';
import type { NeedBarId } from '../needBars';

export const hud = {
  line: outline.regular,
  edge: depth.md,
  outline: outline.color,
  gloss: 'rgba(255,255,255,0.7)',
  track: '#F3E6CC',
  warn: tones.danger.base,
  hintBg: 'rgba(31,58,39,0.78)',
  ringHover: 'rgba(255,216,74,0.45)',
  ringHoverEdge: tones.gold.base,
} as const;

/** Farbton je Bedürfnis. */
export const NEED_TONES: Record<NeedBarId, Tone> = {
  water: tones.sky,
  nutrients: tones.leaf,
  light: tones.gold,
  mood: tones.coral,
};
