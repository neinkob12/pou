import { getPlantStatus, type PlantStatus } from '../../game/timeEngine';
import { useGameStore } from '../../store/gameStore';
import { selectDebugMultiplier } from '../../store/slices/debug';
import { FAST_REFRESH_MS, useNow } from '../../hooks/useNow';
import { harvestStep, type HarvestResult, type HarvestSession, type HarvestStep } from './harvestFlow';

export interface HarvestView {
  step: HarvestStep;
  status: PlantStatus | null;
  /** Seed für die Lupe: gleiche Pflanze, gleiches Bild. */
  seed: number;
  session: HarvestSession | null;
  result: HarvestResult | null;
}

/** Stand des Ernte-Ablaufs aus dem Spielstand, mit Zeitraffer aus dem Debug-Slice (P09). */
export function useHarvestView(): HarvestView {
  const plant = useGameStore((s) => s.plant);
  const session = useGameStore((s) => s.harvestSession);
  const result = useGameStore((s) => s.harvestResult);
  const debugMultiplier = useGameStore(selectDebugMultiplier);
  const now = useNow(FAST_REFRESH_MS);
  const status = plant ? getPlantStatus(plant, now, debugMultiplier) : null;
  return {
    step: harvestStep(status, result !== null),
    status,
    seed: plant?.plantedAtMs ?? 0,
    session,
    result,
  };
}
