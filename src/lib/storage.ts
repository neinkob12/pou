// Lokaler Speicher über MMKV. Spielstand und später Einstellungen liegen hier, kein Login.
// In Jest liefert react-native-mmkv automatisch eine In-Memory-Attrappe.

import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

import type { HighestSeenStore } from '../game/clock';

export const storage = createMMKV({ id: 'potpou' });

/** Adapter für die Persist-Middleware von Zustand. MMKV ist synchron, Laden passiert sofort. */
export const mmkvStateStorage: StateStorage = {
  getItem: (key) => storage.getString(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => {
    storage.remove(key);
  },
};

/**
 * Höchster je gesehener Zeitstempel der Geräteuhr (P27). Eigener Schlüssel außerhalb des
 * Spielstands: übersteht Zurücksetzen und kaputte Spielstände, damit Uhr-Zurückstellen nichts bringt.
 */
export const HIGHEST_SEEN_KEY = 'potpou-clock-highest-seen';

export const highestSeenStore: HighestSeenStore = {
  read: () => storage.getNumber(HIGHEST_SEEN_KEY) ?? null,
  write: (ms) => storage.set(HIGHEST_SEEN_KEY, ms),
};
