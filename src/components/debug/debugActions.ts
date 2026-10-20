import type { StrainId } from '../../game/config';
import { retimeForMultiplier, setAllNeeds, setTurboScale, skipPlantDays } from '../../game/debug';
import { flipLight, harvest, type PlantRecord } from '../../game/timeEngine';
import { useGameStore } from '../../store/gameStore';
import { selectDebugMultiplier } from '../../store/slices/debug';

const START_STRAIN: StrainId = 'gustav';

/** Alle Aktionen des Debug-Menüs. Zeit läuft nur über debugMultiplier und Zeitstempel. */
export function createDebugActions(store = useGameStore, clock: () => number = Date.now) {
  const multiplier = () => selectDebugMultiplier(store.getState());
  const updatePlant = (fn: (plant: PlantRecord) => PlantRecord) => {
    const { plant, setPlant } = store.getState();
    if (plant) setPlant(fn(plant));
  };
  return {
    setMultiplier: (next: number) => {
      const now = clock();
      updatePlant((p) => retimeForMultiplier(p, now, multiplier(), next));
      store.getState().setDebugMultiplier(next);
    },
    skipDays: (days: number) => updatePlant((p) => skipPlantDays(p, days)),
    plantSeed: () => {
      const now = clock();
      store.getState().plantSeed(START_STRAIN, now);
      store.getState().resetNeeds(now);
      store.getState().resetHealth(now);
    },
    flipLight: () => updatePlant((p) => flipLight(p, clock(), multiplier())),
    harvest: () => updatePlant((p) => harvest(p, clock(), multiplier())),
    setNeeds: (level: number) => store.setState((s) => ({ needs: setAllNeeds(s.needs, level, clock()) })),
    giveCoins: (amount: number) => store.getState().addCoins(amount),
    setTurbo: (on: boolean) => {
      const { plant } = store.getState();
      store.setState({ turbo: on, plant: plant ? setTurboScale(plant, clock(), on) : null });
    },
    reset: () => {
      // Startwerte aller Slices; der Lade-Status gehört nicht zum Spielstand und bleibt.
      const now = clock();
      store.setState({ ...store.getInitialState(), hydration: store.getState().hydration }, true);
      store.getState().resetNeeds(now);
      store.getState().resetHealth(now);
    },
  };
}

export type DebugActions = ReturnType<typeof createDebugActions>;
