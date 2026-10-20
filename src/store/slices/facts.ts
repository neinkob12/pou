// Fakten-Slice (P17): freigeschaltete Karten und die Warteschlange fürs Freischalt-Popup.
// Beides wird gespeichert, damit ein Popup nach einem Neustart nicht verloren geht.

import type { PhaseId } from '../../game/config';
import { newlyUnlockedIds } from '../../components/facts/unlock';
import type { SliceCreator } from './types';

export interface FactsSlice {
  /** IDs der freigeschalteten Karten, in Freischalt-Reihenfolge. */
  unlockedFactIds: string[];
  /** Neu freigeschaltete Karten, die Budi noch im Popup zeigen will. */
  pendingFactIds: string[];
  /** Schaltet alle Karten bis zu dieser Phase frei. Rückgabe: die neuen IDs. */
  unlockFactsForPhase: (phase: PhaseId) => string[];
  /** Entfernt die vorderste Karte aus der Popup-Warteschlange. */
  dismissFactPopup: () => void;
}

export const createFactsSlice: SliceCreator<FactsSlice> = (set, get) => ({
  unlockedFactIds: [],
  pendingFactIds: [],
  unlockFactsForPhase: (phase) => {
    const fresh = newlyUnlockedIds(get().unlockedFactIds, phase);
    if (fresh.length > 0) {
      set((s) => ({
        unlockedFactIds: [...s.unlockedFactIds, ...fresh],
        pendingFactIds: [...s.pendingFactIds, ...fresh],
      }));
    }
    return fresh;
  },
  dismissFactPopup: () => set((s) => ({ pendingFactIds: s.pendingFactIds.slice(1) })),
});
