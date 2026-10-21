import type { ColorName, ToneName } from '../../lib/theme';

/** Alte Palettenfarben (ColorName) auf die satten Spiel-Farbtöne abbilden, damit alte Aufrufe passen. */
const COLOR_TONE: Partial<Record<ColorName, ToneName>> = {
  coral: 'coral',
  plantLight: 'leaf',
  plantDark: 'leaf',
  lamp: 'gold',
  terracotta: 'gold',
  lavender: 'grape',
  night: 'night',
  cream: 'cream',
  white: 'cream',
};

export function toneForColor(color: ColorName): ToneName {
  return COLOR_TONE[color] ?? 'stone';
}

/** Füllstand auf 0 bis 1 begrenzen; NaN zählt als leer. */
export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
