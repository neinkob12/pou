// Budis eigene Zeichenfarben (ART-3): Verläufe, Glanz, Konturen je Material. Abgeleitet aus der
// Palette und den Spiel-Look-Tokens (ART-1) in src/lib/theme.ts, damit Budi zum Rest passt. Nur Grafik, keine Spielwerte.

import { artColors, colors, outline, tones } from '../../../lib/theme';

export const budiColors = {
  /** Dunkle Kontur je Material: Topf warm-braun, Pflanze waldgrün (Casual-Game-Look). */
  potLine: '#5A2A1A',
  plantLine: outline.color,
  /** Topf: Verlauf von oben hell nach unten satt, Glanz oben links. */
  potTop: '#F0A77C',
  potMid: colors.terracotta,
  potBottom: '#A9512F',
  potRimTop: '#F6B58C',
  potRimBottom: '#C9693F',
  potBand: '#B65C38',
  gloss: 'rgba(255,255,255,0.75)',
  glossSoft: 'rgba(255,255,255,0.28)',
  glossFade: 'rgba(255,255,255,0)',
  rimShadow: 'rgba(90,42,26,0.35)',
  rimShadowFade: 'rgba(90,42,26,0)',
  soilTop: '#7A4D35',
  soilBottom: '#4A2C1E',
  /** Weicher Schlagschatten auf dem Boden. */
  floorShadow: 'rgba(47,30,40,0.32)',
  floorShadowFade: 'rgba(47,30,40,0)',
  /** Blätter: Spitze hell, Ansatz satt; hintere Blätter dunkler. */
  leafTip: tones.leaf.light,
  leafBase: tones.leaf.dark,
  leafBackTip: '#6DBA5E',
  leafBackBase: tones.leaf.edge,
  leafVein: 'rgba(255,255,255,0.28)',
  stemLight: '#7CC66A',
  stemDark: '#3F8C3C',
  /** Augen: weißes Augenweiß mit Schatten oben, große Iris mit Verlauf. */
  sclera: colors.white,
  scleraShade: '#DCE3EE',
  irisLight: '#8A5A3C',
  irisDark: '#3A2216',
  pupil: '#1A100B',
  eyeLine: '#2A1A12',
  shine: colors.white,
  /** Gesicht */
  cheek: 'rgba(255,122,138,0.75)',
  cheekFade: 'rgba(255,122,138,0)',
  mouth: '#6B1F2C',
  mouthLight: '#9C3244',
  tongue: '#FF8A98',
  tongueShade: '#E6607A',
  tooth: colors.white,
  heart: tones.coral.base,
  heartLight: tones.coral.light,
  tear: artColors.sweat,
  tearLight: '#D6F0FF',
  sick: artColors.sick,
  pale: 'rgba(185,217,138,0.45)',
  brow: '#3A2216',
  sparkle: tones.gold.base,
  sparkleLight: tones.gold.light,
} as const;
