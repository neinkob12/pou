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
  /** Fach unten: Holz. */
  tray: { light: '#F7D3A3', base: '#E9B77F', dark: '#D69D5E', edge: '#9C6638', text: '#4A2E1A' } satisfies Tone,
  pedestal: tones.cream,
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

/** Kacheln der Navigation unten, jede mit eigener Farbe. */
export const NAV_TONES = {
  minigames: tones.grape,
  shop: tones.coral,
  album: tones.leaf,
  settings: tones.sky,
} as const satisfies Record<string, Tone>;
