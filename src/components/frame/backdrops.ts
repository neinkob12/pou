// Spiel-Hintergründe der Screens (ART-5): Verlauf, Muster und Licht je Screen. Reine Daten und
// Rechnungen ohne React, damit testbar. Nur Grafik, kein Spielwert. Gezeichnet wird in Einheiten:
// 100 Einheiten = volle Breite (wie ArtCanvas).

import { starPath } from '../ui/icons/starPath';

export type BackdropVariant = 'age' | 'shop' | 'album' | 'seeds' | 'harvest' | 'settings' | 'games';
export type PatternShape = 'leaf' | 'coin' | 'star' | 'seed' | 'sparkle' | 'diamond' | 'drop';

export interface Backdrop {
  /** Verlauf von oben nach unten. */
  top: string;
  bottom: string;
  /** Farbe des Musters, wird mit geringer Deckkraft gezeichnet. */
  pattern: string;
  shapes: PatternShape[];
  /** Lichtstrahlen von oben (Ernte, Altersfrage). */
  rays: boolean;
}

// Satte Töne der Palette je Screen, damit jeder Ort erkennbar ist (wie Räume in einem Spiel).
export const BACKDROPS: Record<BackdropVariant, Backdrop> = {
  age: { top: '#FFA94D', bottom: '#FFE3A8', pattern: '#FFFFFF', shapes: ['leaf', 'sparkle'], rays: true },
  shop: { top: '#FF7A8A', bottom: '#FFD2B8', pattern: '#FFFFFF', shapes: ['coin', 'sparkle'], rays: false },
  album: { top: '#8E6FE0', bottom: '#E4D9FF', pattern: '#FFFFFF', shapes: ['star', 'sparkle'], rays: false },
  seeds: { top: '#4FB85E', bottom: '#DDF5CC', pattern: '#FFFFFF', shapes: ['seed', 'leaf'], rays: false },
  harvest: { top: '#FFB62E', bottom: '#FFF1BF', pattern: '#FFFFFF', shapes: ['star', 'sparkle'], rays: true },
  settings: { top: '#5FA8E0', bottom: '#DCEFFF', pattern: '#FFFFFF', shapes: ['diamond', 'drop'], rays: false },
  games: { top: '#3FB8A8', bottom: '#D6F5EE', pattern: '#FFFFFF', shapes: ['star', 'drop'], rays: false },
};

/** Abstand der Musterpunkte in Einheiten. */
export const PATTERN_SPACING = 18;
/** Größe eines Musterzeichens in Einheiten. */
export const PATTERN_SIZE = 4.2;
/** Deckkraft des Musters: sichtbar, aber nie unruhig hinter Text. */
export const PATTERN_OPACITY = 0.2;

export interface PatternPoint {
  x: number;
  y: number;
  shape: PatternShape;
  /** Leichte Drehung, damit das Muster gezeichnet und nicht gestempelt wirkt. */
  rotate: number;
}

/**
 * Versetztes Raster über die ganze Fläche (jede zweite Zeile halb verschoben). Formen wechseln
 * sich ab. `heightUnits` = Höhe in Einheiten (Höhe / Breite * 100).
 */
export function patternPoints(
  heightUnits: number,
  shapes: readonly PatternShape[],
  spacing = PATTERN_SPACING,
): PatternPoint[] {
  if (!(heightUnits > 0) || shapes.length === 0 || spacing <= 0) return [];
  const points: PatternPoint[] = [];
  const rows = Math.ceil(heightUnits / spacing) + 1;
  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? spacing / 4 : spacing * 0.75;
    for (let x = offset, col = 0; x < 100 + spacing / 2; x += spacing, col++) {
      const i = row + col;
      points.push({
        x,
        y: row * spacing + spacing / 3,
        shape: shapes[i % shapes.length],
        rotate: ((i * 37) % 50) - 25,
      });
    }
  }
  return points;
}

/** Vierzackiger Funkel-Stern um (0, 0) mit Radius r. */
export function sparklePath(r: number): string {
  const k = r * 0.28;
  return `M0 ${-r} Q${k} ${-k} ${r} 0 Q${k} ${k} 0 ${r} Q${-k} ${k} ${-r} 0 Q${-k} ${-k} 0 ${-r} Z`;
}

/** Blatt um (0, 0), Spitze oben. */
export function leafPath(r: number): string {
  return `M0 ${-r} Q${r} ${-r * 0.2} 0 ${r} Q${-r} ${-r * 0.2} 0 ${-r} Z`;
}

/** Tropfen um (0, 0), Spitze oben. */
export function dropPath(r: number): string {
  return `M0 ${-r} Q${r * 0.9} ${r * 0.1} 0 ${r} Q${-r * 0.9} ${r * 0.1} 0 ${-r} Z`;
}

/** Stern um (0, 0). */
export function starAt0(r: number): string {
  return starPath(0, 0, r);
}

/** Lichtstrahlen als Fächer von oben Mitte: Winkel in Grad (0 = senkrecht nach unten). */
export function rayAngles(count: number, spread = 70): number[] {
  if (count <= 0) return [];
  if (count === 1) return [0];
  return Array.from({ length: count }, (_, i) => -spread / 2 + (spread / (count - 1)) * i);
}
