import { useMemo } from 'react';

import { getPlantStatus, type PlantRecord, type PlantStatus } from '../../../game/timeEngine';
import { useGameStore } from '../../../store/gameStore';
import { getLightState, isAutoflower, type LightState } from './lightCycle';
import { useDebugMultiplier } from './useDebugMultiplier';
import { usePlantClock } from './usePlantClock';

export interface PlantView {
  plant: PlantRecord | null;
  status: PlantStatus | null;
  light: LightState | null;
  autoflower: boolean;
  debugMultiplier: number;
}

/** Pflanze, Status und Licht zum aktuellen Zeitpunkt, alles aus Zeitstempeln berechnet. */
export function usePlantStatus(): PlantView {
  const plant = useGameStore((s) => s.plant);
  const debugMultiplier = useDebugMultiplier();
  const now = usePlantClock(debugMultiplier);
  return useMemo(() => {
    if (!plant) return { plant, status: null, light: null, autoflower: false, debugMultiplier };
    const status = getPlantStatus(plant, now, debugMultiplier);
    const autoflower = isAutoflower(plant.strainId);
    return { plant, status, light: getLightState(status, autoflower), autoflower, debugMultiplier };
  }, [plant, now, debugMultiplier]);
}
