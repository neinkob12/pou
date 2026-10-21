// Farben der Icons (ART-2). Grundlage ist die Palette aus src/lib/theme.ts; hier stehen nur
// Ableitungen und die wenigen Zusatztöne, die Gegenstände brauchen. Nur Grafik, kein Spielwert.

import { artColors, colors } from '../../../lib/theme';
import { darken, mix } from './tint';

export const iconInk = {
  /** Kontur: Budis Waldgrün, etwas tiefer, damit sie auch auf Dunkel trägt. */
  outline: darken(colors.plantDark, 0.25),
  gloss: colors.white,
  shadow: 'rgba(24,44,30,0.38)',
} as const;

/** Schlagschatten unter jedem Icon (Einheiten von 100). */
export const ICON_SHADOW = { dy: 3.5, blur: 2.2, scale: 0.9 } as const;

export const iconColors = {
  water: '#4FB6F5',
  waterDeep: '#2B86D9',
  leaf: colors.plantLight,
  leafDeep: artColors.leafShade,
  sun: '#FFC93C',
  sunRay: '#FF9F2E',
  heart: '#FF5C77',
  coin: '#FFC93C',
  coinRim: '#F09A1E',
  coinFace: '#FFDD6E',
  star: '#FFD23F',
  metal: '#7D8FA0',
  metalLight: '#B9C7D3',
  lockBody: '#FFB534',
  wood: artColors.wood,
  woodDeep: artColors.woodShade,
  gem: '#59D3E8',
  lavender: colors.lavender,
  coral: colors.coral,
  cream: colors.cream,
  paper: '#FFF7E8',
  paperShade: '#EAD9BC',
  seed: artColors.seed,
  seedDeep: mix(artColors.seed, '#3A2416', 0.4),
  white: colors.white,
} as const;
