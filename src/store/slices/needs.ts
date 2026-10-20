// Needs-Slice: gespeicherter Bedürfnis-Zustand (Werte zum Zeitpunkt updatedAtMs).
// Den aktuellen Stand berechnet man mit computeNeeds aus src/game/needs.ts; die Phase kommt
// aus dem Plant-Slice (Hook), die Modifikatoren aus den Shop-Upgrades (P15).

import { gameEvents } from '../../game/events';
import {
  applyCare,
  createNeeds,
  NO_MODIFIERS,
  reviveNeeds,
  type CareAction,
  type NeedModifiers,
  type NeedsState,
} from '../../game/needs';
import type { SliceCreator } from './types';
import { clock } from '../../lib/clock';

export interface NeedsSlice {
  needs: NeedsState;
  /** Pflege-Aktion. Rückgabe: ob sie gewirkt hat (im Koma nicht). Löst `careAction` aus. */
  care: (action: CareAction, nowMs: number, modifiers?: NeedModifiers) => boolean;
  /** Neuer Samen: Balken auf Startwerte. */
  resetNeeds: (nowMs: number) => void;
  /** Aus dem Koma holen. Kosten (Münzen, Werbung) prüft der Aufrufer. */
  reviveFromComa: (nowMs: number) => void;
}

export const createNeedsSlice: SliceCreator<NeedsSlice> = (set, get) => ({
  needs: createNeeds(clock.now()),
  care: (action, nowMs, modifiers = NO_MODIFIERS) => {
    const before = get().needs;
    const after = applyCare(before, action, nowMs, modifiers);
    if (after === before) return false;
    set({ needs: after });
    gameEvents.emit('careAction', { action: action.type, atMs: nowMs });
    return true;
  },
  resetNeeds: (nowMs) => set({ needs: createNeeds(nowMs) }),
  reviveFromComa: (nowMs) => set({ needs: reviveNeeds(nowMs) }),
});
