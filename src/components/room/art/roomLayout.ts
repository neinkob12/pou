// Lage der Möbel im Zimmer, ohne React, damit testbar. Einheiten: Bildbreite = 100.
// Der Boden hängt am unteren Rand (dort stehen Werkzeug-Fach und Navigation, Budi steht darüber),
// Fenster und Regal am oberen Rand. Reine Grafik, keine Spielwerte.

/** Abstand Teppichmitte (Budis Topfboden) zum unteren Bildrand in Punkten. */
export const RUG_FROM_BOTTOM_PX = 262;
/** Abstand Wand/Boden-Kante zum unteren Bildrand in Punkten. */
export const FLOOR_FROM_BOTTOM_PX = 300;
/** Fenster und Regal beginnen frühestens bei diesem Anteil der Bildhöhe (darüber liegen die Balken). */
const FURNITURE_TOP = 0.3;
/** Abstand Fensterbrett zum Boden in Einheiten: Fenster hängt tief, damit die Leisten oben es nicht verdecken. */
const WINDOW_ABOVE_FLOOR = 10;

export interface RoomLayout {
  /** Bildhöhe in Einheiten. */
  height: number;
  floorY: number;
  rugY: number;
  window: { x: number; y: number; w: number; h: number };
  shelf: { x: number; y: number; w: number };
  /** Lichterkette: hängt zwischen Fenster und Regal durch. */
  garland: { x1: number; x2: number; y: number; sag: number };
}

export function roomLayout(widthPx: number, heightPx: number): RoomLayout {
  const unit = widthPx > 0 ? 100 / widthPx : 0;
  const height = heightPx * unit;
  const floorY = Math.max(height * 0.45, height - FLOOR_FROM_BOTTOM_PX * unit);
  const rugY = Math.max(floorY + 4, height - RUG_FROM_BOTTOM_PX * unit);
  const top = height * FURNITURE_TOP;
  const windowH = Math.min(30, Math.max(14, floorY - top - 14));
  const windowY = Math.max(top, floorY - WINDOW_ABOVE_FLOOR - windowH);
  const shelfY = Math.max(top + 16, floorY - 22);
  return {
    height,
    floorY,
    rugY,
    window: { x: 5, y: windowY, w: 24, h: windowH },
    shelf: { x: 72, y: shelfY, w: 24 },
    garland: { x1: 30, x2: 74, y: Math.max(top - 2, windowY - 4), sag: 6 },
  };
}
