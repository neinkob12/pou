// Lage der Möbel im Zimmer, ohne React, damit testbar. Einheiten: Bildbreite = 100.
// Der Boden hängt am unteren Rand (dort steht das Dock mit den Werkzeugen, Budi steht darüber),
// Fenster und Kommode hängen am Boden, damit die Leisten oben sie nicht verdecken.
// Reine Grafik, keine Spielwerte.

/**
 * Abstand Teppichmitte (Budis Topfboden) zum unteren Bildrand in Punkten. Seit dem Redesign liegt
 * die Tab-Leiste unter dem Zimmer; darüber das Dock (RoomDock: 104 Punkte plus 52 Boden), dann Budi.
 */
export const RUG_FROM_BOTTOM_PX = 182;
/** Abstand Wand/Boden-Kante zum unteren Bildrand in Punkten. */
export const FLOOR_FROM_BOTTOM_PX = 226;
/** Fenster und Regal beginnen frühestens bei diesem Anteil der Bildhöhe (darüber liegen die Balken). */
const FURNITURE_TOP = 0.3;
/** Abstand Fensterbrett zum Boden in Einheiten: Fenster hängt tief, damit die Leisten oben es nicht verdecken. */
const WINDOW_ABOVE_FLOOR = 10;
/** Höhe der Holzverkleidung unten an der Wand. */
const WAINSCOT_H = 8;
const DRESSER_H = 15;
/** Platz zwischen Kommode und Poster für Bücher, Kaktus und Nachtlicht. */
const DRESSER_ITEMS_H = 11;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RoomLayout {
  /** Bildhöhe in Einheiten. */
  height: number;
  floorY: number;
  rugY: number;
  /** Oberkante der Holzverkleidung. */
  wainscotY: number;
  /** Glasfläche des Fensters (Himmel). */
  window: Box;
  /** Oberfläche der Kommode rechts (dort stehen Bücher und Nachtlicht). */
  shelf: { x: number; y: number; w: number };
  dresser: Box;
  poster: Box;
  /** Lichterkette: hängt zwischen Fenster und Poster durch. */
  garland: { x1: number; x2: number; y: number; sag: number };
  /** Ampel mit Efeu rechts oben. */
  hanging: { x: number; y: number };
}

export function roomLayout(widthPx: number, heightPx: number): RoomLayout {
  const unit = widthPx > 0 ? 100 / widthPx : 0;
  const height = heightPx * unit;
  const floorY = Math.max(height * 0.45, height - FLOOR_FROM_BOTTOM_PX * unit);
  const rugY = Math.max(floorY + 4, height - RUG_FROM_BOTTOM_PX * unit);
  const top = height * FURNITURE_TOP;
  const windowH = Math.min(30, Math.max(14, floorY - top - 14));
  const windowY = Math.max(top, floorY - WINDOW_ABOVE_FLOOR - windowH);
  const dresser = { x: 71, y: floorY - DRESSER_H + 1, w: 27, h: DRESSER_H };
  // Auf kleinen Bildschirmen wird das Poster kleiner, unter 6 Einheiten fällt es weg (siehe Poster).
  const posterH = Math.min(18, Math.max(0, dresser.y - DRESSER_ITEMS_H - top));
  const poster = { x: 74, y: dresser.y - DRESSER_ITEMS_H - posterH, w: 15, h: posterH };
  return {
    height,
    floorY,
    rugY,
    wainscotY: floorY - WAINSCOT_H,
    window: { x: 6, y: windowY, w: 24, h: windowH },
    shelf: { x: dresser.x, y: dresser.y, w: dresser.w },
    dresser,
    poster,
    garland: { x1: 31, x2: 72, y: Math.max(top - 2, windowY - 4), sag: 6 },
    hanging: { x: 94, y: Math.max(top, poster.y - 2) },
  };
}
