// Globaler Spielzustand: setzt alle Slices aus src/store/slices/index.ts zusammen und speichert
// den Spielstand über MMKV. Gehört P01 und P02.
//
// Persistenz: Gespeichert wird jeder Wert, der keine Funktion ist, aus allen registrierten Slices.
// Ein neuer Slice wird also automatisch mitgespeichert. Ändert sich die Form gespeicherter Daten,
// SAVE_VERSION erhöhen und in MIGRATIONS einen Schritt von der alten Version ergänzen.

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage, safeSet, storage } from '../lib/storage';
import { slices, type GameState } from './slices';
import type { SliceCreator, SliceGet, SliceSet } from './slices/types';

export type { GameState } from './slices';

/** Schlüssel des Spielstands in MMKV. */
export const SAVE_KEY = 'potpou-save';
/** Hierhin wird ein Spielstand kopiert, der sich nicht laden ließ, bevor er überschrieben wird. */
export const SAVE_BACKUP_KEY = `${SAVE_KEY}-backup`;
/** Aktuelle Version des Spielstands. */
export const SAVE_VERSION = 2;

/** pending: Spielstand wird geladen. ready: geladen (oder keiner da). failed: kaputt, Startwerte. */
export type HydrationStatus = 'pending' | 'ready' | 'failed';

export interface HydrationState {
  hydration: HydrationStatus;
}

export type GameStore = GameState & HydrationState;

type DataKeys<T> = { [K in keyof T]: T[K] extends (...args: never[]) => unknown ? never : K }[keyof T];

/** Gespeicherter Teil des Zustands: alle Werte ohne Funktionen und ohne Hydration-Status. */
export type SaveData = Pick<GameState, DataKeys<GameState>>;

type RawSave = Record<string, unknown>;

/** Schritte je Ausgangsversion: MIGRATIONS[n] macht aus Version n die Version n + 1. */
const MIGRATIONS: Record<number, (save: RawSave) => RawSave> = {
  // Version 1 (P01-Stand) kannte noch keine Statistik.
  1: (save) => ({ ...save, harvestsTotal: 0 }),
};

/** Hebt einen alten Spielstand Schritt für Schritt auf SAVE_VERSION. */
export function migrate(old: unknown, fromVersion: number): SaveData {
  let save: RawSave = old && typeof old === 'object' ? { ...(old as RawSave) } : {};
  for (let v = Math.max(fromVersion, 1); v < SAVE_VERSION; v++) {
    const step = MIGRATIONS[v];
    if (step) save = step(save);
  }
  // Felder, die hier fehlen, füllt das Zusammenführen mit den Startwerten der Slices.
  return save as SaveData;
}

/** Wählt aus dem Gesamtzustand aus, was gespeichert wird. */
export function toSaveData(state: GameStore): SaveData {
  const save: RawSave = {};
  for (const [key, value] of Object.entries(state)) {
    if (typeof value === 'function' || key === 'hydration') continue;
    save[key] = value;
  }
  return save as SaveData;
}

export function createGameState(set: SliceSet<GameState>, get: SliceGet<GameState>): GameState {
  const state = {} as GameState;
  for (const createSlice of Object.values(slices)) {
    // Jeder Slice ist auf seinen Teilzustand typisiert; zur Laufzeit teilen sich alle einen Store.
    Object.assign(state, (createSlice as unknown as SliceCreator<GameState>)(set, get));
  }
  return state;
}

let storeCreated = false;
let hydrationFailed = false;

function backupBrokenSave() {
  const raw = storage.getString(SAVE_KEY);
  if (raw !== undefined) safeSet(SAVE_BACKUP_KEY, raw);
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...createGameState(set as SliceSet<GameState>, get),
      hydration: 'pending' as HydrationStatus,
    }),
    {
      name: SAVE_KEY,
      version: SAVE_VERSION,
      storage: createJSONStorage(() => mmkvStateStorage),
      partialize: toSaveData,
      migrate,
      onRehydrateStorage: () => {
        hydrationFailed = false;
        return (_state, error) => {
          if (error === undefined) return;
          console.warn('[gameStore] Spielstand nicht ladbar, starte mit Startwerten.', error);
          backupBrokenSave();
          hydrationFailed = true;
          if (storeCreated) syncHydrationStatus();
        };
      },
    },
  ),
);

function syncHydrationStatus() {
  const status: HydrationStatus = useGameStore.persist.hasHydrated()
    ? 'ready'
    : hydrationFailed
      ? 'failed'
      : 'pending';
  if (useGameStore.getState().hydration !== status) useGameStore.setState({ hydration: status });
}

// MMKV ist synchron: Beim ersten Laden ist die Hydration schon vorbei, bevor die Listener hängen.
storeCreated = true;
useGameStore.persist.onFinishHydration(syncHydrationStatus);
syncHydrationStatus();
