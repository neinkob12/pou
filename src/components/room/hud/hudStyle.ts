// Look der Zimmer-Leisten (ART-4): Sticker-Karten mit dicker Kontur und Kante unten, kräftige
// Farben je Bedürfnis. Nur Darstellung, keine Spielwerte.

import { colors, surface } from '../../../lib/theme';
import type { NeedBarId } from '../needBars';

export const hud = {
  line: 2.5,
  edge: 5,
  outline: colors.plantDark,
  face: colors.white,
  faceSoft: '#FFF9EE',
  edgeColor: '#D9C7A6',
  gloss: 'rgba(255,255,255,0.7)',
  track: '#F3E6CC',
  warn: '#FF4D5E',
  chip: colors.cream,
  // Fach unten: Holz mit hellem Rand.
  tray: '#E9B77F',
  trayEdge: '#B97A43',
  trayInner: '#F7D3A3',
  pedestal: '#FFF4E0',
  pedestalEdge: '#D9B988',
  hintBg: 'rgba(47,93,58,0.78)',
  ringHover: 'rgba(255,224,110,0.55)',
  ringHoverEdge: '#FFD84A',
  line2: surface.line,
} as const;

/** Füllfarbe und dunklere Kante je Bedürfnis. */
export const NEED_TONES: Record<NeedBarId, { fill: string; deep: string }> = {
  water: { fill: '#4FB4F0', deep: '#2A7FC0' },
  nutrients: { fill: colors.plantLight, deep: '#4E9A49' },
  light: { fill: colors.lamp, deep: '#D9A12B' },
  mood: { fill: colors.coral, deep: '#E25A73' },
};

/** Kacheln der Navigation unten, jede mit eigener Farbe. */
export const NAV_TONES = {
  minigames: { face: '#B9A0F2', edge: '#7A58C9' },
  shop: { face: '#FFB0BD', edge: '#E25A73' },
  album: { face: '#A6E39A', edge: '#4E9A49' },
  settings: { face: '#9FD8F5', edge: '#3F8FC4' },
} as const;
