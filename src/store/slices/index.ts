// Registrierungsliste aller Store-Slices.
// Büro-Regel: Eigener Slice als Datei src/store/slices/<bereich>.ts, hier eine Zeile im
// Objekt `slices` (plus Import). Der Schlüssel ist der Bereichsname.

import { createDailyGoalsSlice } from './dailyGoals';
import { createDebugSlice } from './debug';
import { createFactsSlice } from './facts';
import { createHarvestSlice } from './harvest';
import { createHealthSlice } from './health';
import { createJumpSlice } from './jump';
import { createMinigamesSlice } from './minigames';
import { createNeedsSlice } from './needs';
import { createOnboardingSlice } from './onboarding';
import { createPlantSlice } from './plant';
import { createProgressionSlice } from './progression';
import { createShopSlice } from './shop';

export const slices = {
  plant: createPlantSlice,
  health: createHealthSlice,
  needs: createNeedsSlice,
  progression: createProgressionSlice,
  debug: createDebugSlice,
  onboarding: createOnboardingSlice,
  minigames: createMinigamesSlice,
  jump: createJumpSlice,
  harvest: createHarvestSlice,
  shop: createShopSlice,
  facts: createFactsSlice,
  dailyGoals: createDailyGoalsSlice,
};

type UnionToIntersection<U> = (U extends unknown ? (arg: U) => void : never) extends (
  arg: infer I,
) => void
  ? I
  : never;

/** Gesamtzustand: Schnittmenge aller registrierten Slices. */
export type GameState = UnionToIntersection<ReturnType<(typeof slices)[keyof typeof slices]>>;
