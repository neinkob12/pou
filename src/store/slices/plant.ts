// Plant-Slice: aktuelle Pflanze, Münzen, Turbo und Statistiken. Wird mit dem Spielstand gespeichert.

import type { StrainId } from '../../game/config';
import { applyTurbo, createPlant, type PlantRecord } from '../../game/timeEngine';
import type { SliceCreator } from './types';

export interface PlantSlice {
  plant: PlantRecord | null;
  coins: number;
  turbo: boolean;
  /** Statistik: abgeschlossene Ernten über alle Zyklen. */
  harvestsTotal: number;
  plantSeed: (strainId: StrainId, nowMs: number) => void;
  setPlant: (plant: PlantRecord | null) => void;
  addCoins: (amount: number) => void;
  /** Zieht Münzen ab, wenn genug da sind. Rückgabe: ob es geklappt hat. */
  spendCoins: (amount: number) => boolean;
  activateTurbo: (nowMs: number) => void;
  /** Zählt eine abgeschlossene Ernte in der Statistik. */
  recordHarvest: () => void;
}

export const createPlantSlice: SliceCreator<PlantSlice> = (set, get) => ({
  plant: null,
  coins: 0,
  turbo: false,
  harvestsTotal: 0,
  plantSeed: (strainId, nowMs) => set({ plant: createPlant(strainId, nowMs, get().turbo) }),
  setPlant: (plant) => set({ plant }),
  addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),
  spendCoins: (amount) => {
    if (get().coins < amount) return false;
    set((s) => ({ coins: s.coins - amount }));
    return true;
  },
  activateTurbo: (nowMs) =>
    set((s) => ({ turbo: true, plant: s.plant ? applyTurbo(s.plant, nowMs) : null })),
  recordHarvest: () => set((s) => ({ harvestsTotal: s.harvestsTotal + 1 })),
});
