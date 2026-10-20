// Lage der Möbel im Zimmer, ohne React, damit testbar. Einheiten: Bildbreite = 100.
// Der Boden hängt am unteren Rand (dort stehen Werkzeug-Fach und Navigation, Budi steht darüber),
// Fenster und Regal am oberen Rand. Reine Grafik, keine Spielwerte.

/** Abstand Teppichmitte (Budis Topfboden) zum unteren Bildrand in Punkten. */
export const RUG_FROM_BOTTOM_PX = 262;
/** Abstand Wand/Boden-Kante zum unteren Bildrand in Punkten. */
export const FLOOR_FROM_BOTTOM_PX = 300;
/** Fenster und Regal beginnen bei diesem Anteil der Bildhöhe. */
const FURNITURE_TOP = 0.3;

export interface RoomLayout {
  /** Bildhöhe in Einheiten. */
  height: number;
  floorY: number;
  rugY: number;
  window: { x: number; y: number; w: number; h: number };
  shelf: { x: number; y: number; w: number };
}

export function roomLayout(widthPx: number, heightPx: number): RoomLayout {
  const unit = widthPx > 0 ? 100 / widthPx : 0;
  const height = heightPx * unit;
  const floorY = Math.max(height * 0.45, height - FLOOR_FROM_BOTTOM_PX * unit);
  const rugY = Math.max(floorY + 4, height - RUG_FROM_BOTTOM_PX * unit);
  const top = height * FURNITURE_TOP;
  return {
    height,
    floorY,
    rugY,
    window: { x: 5, y: top, w: 24, h: Math.min(30, Math.max(14, floorY - top - 14)) },
    shelf: { x: 72, y: top + 16, w: 24 },
  };
}
