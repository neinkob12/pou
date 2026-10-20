// Harvest-Slice (P24): Werte vom Schnitt bis zum Einsammeln und das Ergebnis für den Abschluss-Screen.
// Wird mit dem Spielstand gespeichert, weil das Trocknen Stunden dauert. Logik in
// src/components/harvest/harvestFlow.ts, Ablauf über Slices hinweg in useHarvestActions.

import { addDryingTurn, type HarvestResult, type HarvestSession } from '../../components/harvest/harvestFlow';
import type { SliceCreator } from './types';

export interface HarvestSlice {
  /** Läuft zwischen Schnitt und Einsammeln, sonst null. */
  harvestSession: HarvestSession | null;
  /** Ergebnis der letzten Ernte, bis der Spieler den Abschluss verlässt. */
  harvestResult: HarvestResult | null;
  startHarvestSession: (session: HarvestSession) => void;
  /** Einmal wenden im Trocknungs-Fenster `window`. Ohne Session passiert nichts. */
  turnDrying: (window: number) => void;
  /** Ernte eingesammelt: Session endet, Ergebnis bleibt für den Abschluss. */
  finishHarvest: (result: HarvestResult) => void;
  /** Hook für P29: Münzen verdoppelt. */
  markCoinsDoubled: () => void;
  clearHarvestResult: () => void;
}

export const createHarvestSlice: SliceCreator<HarvestSlice> = (set) => ({
  harvestSession: null,
  harvestResult: null,
  startHarvestSession: (session) => set({ harvestSession: session, harvestResult: null }),
  turnDrying: (window) =>
    set((s) => (s.harvestSession ? { harvestSession: addDryingTurn(s.harvestSession, window) } : {})),
  finishHarvest: (result) => set({ harvestSession: null, harvestResult: result }),
  markCoinsDoubled: () =>
    set((s) => (s.harvestResult ? { harvestResult: { ...s.harvestResult, coinsDoubled: true } } : {})),
  clearHarvestResult: () => set({ harvestResult: null }),
});
