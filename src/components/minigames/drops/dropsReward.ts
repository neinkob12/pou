// Rundenende von "Tropfen fangen": gefangene Tropfen füllen Wasser- und Nährstoffbalken.
// Jede Füllung geht über den Needs-Slice und damit über applyCare (src/game/needs.ts).

import { NEED_MAX, NEED_THRESHOLDS, OVERWATER_LIMIT_BY_PHASE } from '../../../game/config';
import { clock } from '../../../lib/clock';
import { useGameStore } from '../../../store/gameStore';
import { selectDebugMultiplier } from '../../../store/slices/debug';
import { computeCareView } from '../../room/care/careLogic';
import { roundReward, type DropsReward } from './dropsLogic';

/**
 * Schreibt den Balken-Zuwachs einer Runde gut. Rückgabe: was wirklich aufgefüllt wurde,
 * null ohne Pflanze, im Trocknen oder im Koma (dann füllt sich nichts).
 */
export function applyDropsReward(
  caughtWater: number,
  caughtFertilizer: number,
  nowMs: number = clock.now(),
): DropsReward | null {
  const state = useGameStore.getState();
  const view = computeCareView(state.plant, state.needs, nowMs, selectDebugMultiplier(state));
  if (!view.canCare || !view.phase || !view.snapshot) return null;

  const phase = view.phase;
  const limits = { water: OVERWATER_LIMIT_BY_PHASE[phase] ?? NEED_THRESHOLDS.overwatered, nutrients: NEED_MAX };
  const reward = roundReward(caughtWater, caughtFertilizer, view.snapshot, limits);

  // Universaldünger passt in jeder Phase, also kein Stress durch falschen Dünger.
  if (reward.water > 0) state.care({ type: 'water', phase, amount: reward.water }, nowMs);
  if (reward.nutrients > 0) state.care({ type: 'fertilize', phase, amount: reward.nutrients }, nowMs);
  return reward;
}
