// Geteilte Spieluhr (P27b): eine monotone Uhr für die ganze App. Alle Spielzeit-Aufrufer nehmen
// clock.now() statt Date.now(), damit eine zurückgestellte Geräteuhr das Pflanzenalter nie senkt.
// Absichtlich ohne Import des Stores: needs.ts ruft die Uhr schon beim Anlegen des Stores,
// ein Import von gameStore hier gäbe einen Zyklus.

import { createMonotonicClock, highestTimestampInSave } from '../game/clock';
import { highestSeenStore, storage } from './storage';

/** Schlüssel des Spielstands, muss SAVE_KEY in src/store/gameStore.ts entsprechen (Test prüft das). */
export const SAVE_STORAGE_KEY = 'potpou-save';

/** Startwert, wenn noch kein Höchststand gespeichert ist: höchster Zeitstempel im gespeicherten Spielstand. */
export function seedFromSavedGame(): number | null {
  const raw = storage.getString(SAVE_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    const state = parsed && typeof parsed === 'object' ? (parsed as { state?: unknown }).state : null;
    return highestTimestampInSave(state);
  } catch {
    return null;
  }
}

export const clock = createMonotonicClock(highestSeenStore, () => Date.now(), seedFromSavedGame);
