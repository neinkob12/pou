// Health-Slice: Schädlinge, Schimmel, Schutz, Koma (Logik in src/game/health.ts, UI kommt mit P21).
// Der RNG-Seed liegt im Zustand und wird nach jedem Check weitergedreht, damit Würfe nach einem
// Neustart reproduzierbar bleiben.

import { COMA_REVIVE_COINS, MOLD_TREATMENT_COINS } from '../../game/config';
import { gameEvents } from '../../game/events';
import {
  createHealthState,
  createRng,
  grantPestProtection,
  noteCare,
  removePest,
  revive,
  runHealthChecks,
  treatMold,
  type HealthCheckOptions,
  type HealthState,
} from '../../game/health';
import type { PlantRecord } from '../../game/timeEngine';
import type { SliceCreator } from './types';

/** Zieht Münzen ab, wenn genug da sind (z. B. spendCoins aus dem Plant-Slice). */
export type PayCoins = (amount: number) => boolean;

export interface HealthSlice {
  health: HealthState;
  healthSeed: number;
  checkHealth: (plant: PlantRecord, nowMs: number, options: HealthCheckOptions) => void;
  tapPest: (pestId: string) => void;
  /** Rückgabe: ob bezahlt und behandelt wurde. */
  cureMold: (pay: PayCoins) => boolean;
  protectFromPests: (nowMs: number, durationMs?: number) => void;
  recordCare: (atMs: number) => void;
  /** Rückgabe: ob bezahlt und wiederbelebt wurde. */
  reviveBudi: (nowMs: number, pay: PayCoins) => boolean;
  /** Neue Pflanze: Gesundheit zurücksetzen, Würfeln startet ab jetzt. */
  resetHealth: (nowMs: number, seed?: number) => void;
}

const nextSeed = (rng: () => number) => Math.floor(rng() * 4294967296);

export const createHealthSlice: SliceCreator<HealthSlice> = (set, get) => {
  // Pflege aus P04/P10 kommt als Ereignis; so bleibt die Koma-Uhr ohne fremde Dateien aktuell.
  gameEvents.on('careAction', ({ atMs }) => get().recordCare(atMs));

  return {
    health: createHealthState(),
    healthSeed: 1,
    checkHealth: (plant, nowMs, options) => {
      const rng = createRng(get().healthSeed);
      const health = runHealthChecks(get().health, plant, nowMs, rng, options);
      if (health === get().health) return;
      set({ health, healthSeed: nextSeed(rng) });
    },
    tapPest: (pestId) => set((s) => ({ health: removePest(s.health, pestId) })),
    cureMold: (pay) => {
      if (get().health.moldSinceMs === null || !pay(MOLD_TREATMENT_COINS)) return false;
      set((s) => ({ health: treatMold(s.health) }));
      return true;
    },
    protectFromPests: (nowMs, durationMs) =>
      set((s) => ({ health: grantPestProtection(s.health, nowMs, durationMs) })),
    recordCare: (atMs) => set((s) => ({ health: noteCare(s.health, atMs) })),
    reviveBudi: (nowMs, pay) => {
      if (!pay(COMA_REVIVE_COINS)) return false;
      set((s) => ({ health: revive(s.health, nowMs) }));
      return true;
    },
    resetHealth: (nowMs, seed) =>
      set((s) => ({
        health: { ...createHealthState(), lastCheckAtMs: nowMs, lastCareAtMs: nowMs },
        healthSeed: seed ?? s.healthSeed,
      })),
  };
};
