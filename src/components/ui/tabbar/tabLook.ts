// Aussehen der Tab-Leiste (ohne React, damit testbar). Nur Darstellung, keine Spielwerte.

import { tones, type Tone } from '../../../lib/theme';
import type { UiAssetId } from '../../../lib/assets';

export type TabIconId = UiAssetId | 'budi';

/** Höhe der Leiste ohne Sicherheitsabstand unten. */
export const BAR_HEIGHT = 62;
/** Kachel unter dem aktiven Tab: ragt oben aus der Leiste. */
export const TILE = { width: 66, height: 60, top: -12 } as const;
export const ICON_SIZE = 32;

/** Sichtbare Tabs in Reihenfolge des Layouts, je Icon und Farbe der Kachel. */
export const TAB_LOOK: Record<string, { icon: TabIconId; tone: Tone }> = {
  index: { icon: 'budi', tone: tones.gold },
  minigames: { icon: 'u12_minigames', tone: tones.grape },
  shop: { icon: 'u12_shop', tone: tones.coral },
  album: { icon: 'u12_album', tone: tones.leaf },
  settings: { icon: 'u12_settings', tone: tones.sky },
};

/** Lage des Icons: aktiv hebt es sich in die Kachel und macht Platz für den Namen. */
export function tabIconPose(progress: number): { translateY: number; scale: number } {
  'worklet';
  const p = Math.min(1, Math.max(0, progress));
  return { translateY: 8 - 20 * p, scale: 0.92 + 0.22 * p };
}
