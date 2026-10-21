// Farben der Icons (ART-2). Grundlage sind die Spiel-Tokens von ART-1 in src/lib/theme.ts (tones,
// outline, gloss); hier stehen nur Zuordnungen und wenige Zusatztöne für Gegenstände. Nur Grafik.

import { artColors, colors, gloss, outline, tones } from '../../../lib/theme';
import { mix } from './tint';

export const iconInk = {
  /** Dieselbe dunkle Kontur wie Knöpfe und Karten. */
  outline: outline.color,
  gloss: gloss.color,
  shadow: 'rgba(31,58,39,0.38)',
} as const;

/** Schlagschatten unter jedem Icon (Einheiten von 100). */
export const ICON_SHADOW = { dy: 3.5, blur: 2.2, scale: 0.9 } as const;

export const iconColors = {
  water: tones.sky.base,
  waterDeep: tones.sky.edge,
  leaf: tones.leaf.base,
  leafDeep: artColors.leafShade,
  sun: tones.gold.base,
  sunRay: tones.gold.dark,
  heart: tones.coral.base,
  coin: tones.gold.base,
  coinRim: tones.gold.dark,
  coinFace: tones.gold.light,
  star: '#FFD23F',
  metal: '#7D8FA0',
  metalLight: '#B9C7D3',
  lockBody: '#FFB534',
  wood: artColors.wood,
  woodDeep: artColors.woodShade,
  gem: '#59D3E8',
  lavender: tones.grape.base,
  coral: tones.coral.base,
  cream: colors.cream,
  paper: '#FFF7E8',
  paperShade: '#EAD9BC',
  seed: artColors.seed,
  seedDeep: mix(artColors.seed, '#3A2416', 0.4),
  white: colors.white,
} as const;
