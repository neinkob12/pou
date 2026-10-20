// Registrierungsliste aller Store-Slices.
// Büro-Regel: Eigener Slice als Datei src/store/slices/<bereich>.ts, hier eine Zeile im
// Objekt `slices` (plus Import). Der Schlüssel ist der Bereichsname.

import { createDebugSlice } from './debug';
import { createHealthSlice } from './health';
import { createNeedsSlice } from './needs';
import { createPlantSlice } from './plant';
import { createShopSlice } from './shop';

export const slices = {
  plant: createPlantSlice,
  health: createHealthSlice,
  needs: createNeedsSlice,
  debug: createDebugSlice,
  shop: createShopSlice,
};

type UnionToIntersection<U> = (U extends unknown ? (arg: U) => void : never) extends (
  arg: infer I,
) => void
  ? I
  : never;

/** Gesamtzustand: Schnittmenge aller registrierten Slices. */
export type GameState = UnionToIntersection<ReturnType<(typeof slices)[keyof typeof slices]>>;
