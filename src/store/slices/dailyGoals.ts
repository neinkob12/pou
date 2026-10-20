// Tagesziele-Slice (Auftrag P19): das Ziel des Tages mit Fortschritt und Kiste.
// Fortschritt kommt aus den Ereignissen `minigameFinished` (P08) und `careAction` (P04).
// Persistenz kommt automatisch mit P02 (alle Slices werden mitgespeichert).

import { applyGoalEvent, claimChest, ensureDailyGoal, type DailyGoalState } from '../../game/dailyGoals';
import { gameEvents } from '../../game/events';
import type { SliceCreator } from './types';

export interface DailyGoalsSlice {
  /** Ziel des zuletzt gesehenen Tages; null, bis der Raum oder ein Ereignis es anlegt. */
  dailyGoal: DailyGoalState | null;
  /** Legt bei Tageswechsel das neue Ziel an. Aus dem Raum mit der aktuellen Zeit aufgerufen. */
  refreshDailyGoal: (nowMs: number) => void;
  /**
   * Öffnet die Kiste und schreibt die Münzen über `addCoins` gut (Plant-Slice, P02).
   * Rückgabe: gutgeschriebene Münzen, 0 wenn nichts zu holen war.
   */
  claimDailyGoalChest: (nowMs: number, addCoins: (amount: number) => void) => number;
}

export const createDailyGoalsSlice: SliceCreator<DailyGoalsSlice> = (set, get) => {
  gameEvents.on('minigameFinished', (payload) =>
    set({ dailyGoal: applyGoalEvent(get().dailyGoal, { type: 'minigameFinished', ...payload }) }),
  );
  gameEvents.on('careAction', (payload) =>
    set({ dailyGoal: applyGoalEvent(get().dailyGoal, { type: 'careAction', ...payload }) }),
  );

  return {
    dailyGoal: null,
    refreshDailyGoal: (nowMs) => {
      const current = get().dailyGoal;
      const next = ensureDailyGoal(current, nowMs);
      if (next !== current) set({ dailyGoal: next });
    },
    claimDailyGoalChest: (nowMs, addCoins) => {
      const { state, coins } = claimChest(ensureDailyGoal(get().dailyGoal, nowMs));
      set({ dailyGoal: state });
      if (coins > 0) addCoins(coins);
      return coins;
    },
  };
};
