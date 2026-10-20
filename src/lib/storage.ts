// Lokaler Speicher über MMKV. Spielstand und später Einstellungen liegen hier, kein Login.
// In Jest liefert react-native-mmkv automatisch eine In-Memory-Attrappe.

import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const storage = createMMKV({ id: 'potpou' });

/** Adapter für die Persist-Middleware von Zustand. MMKV ist synchron, Laden passiert sofort. */
export const mmkvStateStorage: StateStorage = {
  getItem: (key) => storage.getString(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => {
    storage.remove(key);
  },
};
