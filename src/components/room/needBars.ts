// Die vier Balken für NeedBars (ohne React, damit testbar). Die Werte kommen aus
// needBarValues in care/careLogic.ts; hier stehen nur Reihenfolge, Farben und Icons.

import type { ColorName } from '../../lib/theme';
import type { UiAssetId } from '../../lib/assets';

export type NeedBarId = 'water' | 'nutrients' | 'light' | 'mood';

export interface NeedBarDef {
  id: NeedBarId;
  color: ColorName;
  icon: UiAssetId;
}

export const NEED_BARS: readonly NeedBarDef[] = [
  { id: 'water', color: 'night', icon: 'u11_water' },
  { id: 'nutrients', color: 'plantLight', icon: 'u11_nutrients' },
  { id: 'light', color: 'lamp', icon: 'u11_light' },
  { id: 'mood', color: 'coral', icon: 'u11_mood' },
];

/** Füllstand je Balken, 0 bis 100. */
export type NeedBarValues = Record<NeedBarId, number>;

/** Sichtbare Platzhalterwerte (keine Spielregel), damit man alle Balken unterscheiden kann. */
export const PLACEHOLDER_NEED_VALUES: NeedBarValues = { water: 80, nutrients: 60, light: 70, mood: 90 };
