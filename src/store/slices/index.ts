// Registrierungsliste aller Store-Slices.
// Büro-Regel: Eigener Slice als Datei src/store/slices/<bereich>.ts, hier eine Zeile im
// Objekt `slices` (plus Import). Der Schlüssel ist der Bereichsname.

import { createHealthSlice } from './health';
import { createNeedsSlice } from './needs';
import { createPlantSlice } from './plant';
import { createProgressionSlice } from './progression';

export const slices = {
  plant: createPlantSlice,
  health: createHealthSlice,
  needs: createNeedsSlice,
  progression: createProgressionSlice,
};

type UnionToIntersection<U> = (U extends unknown ? (arg: U) => void : never) extends (
  arg: infer I,
) => void
  ? I
  : never;

/** Gesamtzustand: Schnittmenge aller registrierten Slices. */
export type GameState = UnionToIntersection<ReturnType<(typeof slices)[keyof typeof slices]>>;
