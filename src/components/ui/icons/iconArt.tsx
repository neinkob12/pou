import type { ReactNode } from 'react';

import { CARE_ICONS, type CareIconId } from './careIcons';
import { HUD_ICONS, type HudIconId } from './hudIcons';
import { ITEMS, type ItemIconId } from './itemArt';
import { IconFrame } from './shapes';
import { STRAIN_ICONS, type SeedPacketId, type StrainBadgeId } from './strainArt';

// Alle Icons im Spiele-Look (ART-2): dicke Kontur, Verlauf, Glanz, Schatten. Einheiten 100 × 100.
// Dieselben Zeichnungen landen als PNG in assets/ (assets/render-art.cjs).

export type GameIconId = HudIconId | CareIconId | ItemIconId | StrainBadgeId | SeedPacketId;

const ICONS: Record<GameIconId, () => ReactNode> = {
  ...HUD_ICONS,
  ...CARE_ICONS,
  ...ITEMS,
  ...STRAIN_ICONS,
};

/** Alle Icon-IDs, etwa für das Icon-Blatt. */
export const GAME_ICON_IDS = Object.keys(ICONS) as GameIconId[];

/** Ein Icon zeichnen (in einer auf 100 Einheiten skalierten Skia-Gruppe), mit Schlagschatten. */
export function IconArt({ id, shadow = true }: { id: GameIconId; shadow?: boolean }) {
  return <IconFrame shadow={shadow}>{ICONS[id]()}</IconFrame>;
}
