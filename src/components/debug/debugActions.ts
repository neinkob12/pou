import { LEVEL_XP_THRESHOLDS, STRAINS, type StrainId } from '../../game/config';
import { retimeForMultiplier, setAllNeeds, setTurboScale, skipPlantDays } from '../../game/debug';
import { STRAIN_ORDER, type ProgressStats } from '../../game/progression';
import { flipLight, harvest, type PlantRecord } from '../../game/timeEngine';
import { useGameStore } from '../../store/gameStore';
import { selectDebugMultiplier } from '../../store/slices/debug';
import { toProgressStats } from '../../store/slices/progression';
import { clock as sharedClock } from '../../lib/clock';

const START_STRAIN: StrainId = 'gustav';
const EVENT_STRAIN: StrainId = 'koelsch';

/**
 * Hebt die Zähler so weit an, dass jede Bedingung aus STRAINS.unlock erfüllt ist.
 * Nur anheben, nie senken: Zähler wachsen im Spiel ausschließlich.
 */
export function statsUnlockingAll(stats: ProgressStats): ProgressStats {
  let { xp, harvests, seedFragments } = stats;
  for (const id of STRAIN_ORDER) {
    const u = STRAINS[id].unlock;
    if (u.type === 'harvests') harvests = Math.max(harvests, u.count);
    if (u.type === 'seedFragments') seedFragments = Math.max(seedFragments, u.count);
    if (u.type === 'level') xp = Math.max(xp, LEVEL_XP_THRESHOLDS[u.level - 1] ?? 0);
  }
  return { ...stats, xp, harvests, seedFragments };
}

/** Alle Aktionen des Debug-Menüs. Zeit läuft nur über debugMultiplier und Zeitstempel. */
export function createDebugActions(store = useGameStore, clock: () => number = sharedClock.now) {
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
    unlockAllStrains: () => {
      const s = store.getState();
      const next = statsUnlockingAll(toProgressStats(s));
      store.setState({ xp: next.xp, progressHarvests: next.harvests, seedFragments: next.seedFragments });
      STRAIN_ORDER.filter((id) => STRAINS[id].unlock.type === 'event').forEach((id) => s.unlockStrainByEvent(id));
    },
    unlockEventStrain: () => store.getState().unlockStrainByEvent(EVENT_STRAIN),
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
