// Debug-Werkzeuge (Auftrag P09). Reines TypeScript, nur vom Debug-Menü im Entwicklungs-Build genutzt.
// Der Zeitraffer läuft ausschließlich über den debugMultiplier der timeEngine.

import { DEBUG_SPEED_MULTIPLIER, TIME_SCALE, TURBO_TIME_SCALE } from './config';
import { NEED_IDS, type NeedsState, type NeedValues } from './needs';
import { addBonusDays, currentScale, plantAgeDays, type PlantRecord } from './timeEngine';

/** Auswahl im Debug-Menü. Kein Balancing, deshalb nicht in config.ts. */
export const DEBUG_OPTIONS = {
  multipliers: [1, 100, 1000],
  skipPlantDays: [1, 7, 30],
  coinGifts: [100, 1000],
  needLevels: [0, 10, 50, 100],
} as const;

/** Im Release-Build gilt immer der Produktionswert, egal was im Spielstand steht. */
export function effectiveDebugMultiplier(requested: number, isDev: boolean): number {
  if (!isDev || !Number.isFinite(requested) || requested <= 0) return DEBUG_SPEED_MULTIPLIER;
  return requested;
}

/**
 * Wechselt den Zeitraffer, ohne dass das Alter springt: debugMultiplier wirkt in der timeEngine
 * auf die gesamte vergangene Zeit, deshalb gleichen wir den Sprung über bonusPlantDays aus.
 */
export function retimeForMultiplier(
  plant: PlantRecord,
  nowMs: number,
  fromMultiplier: number,
  toMultiplier: number,
): PlantRecord {
  const before = plantAgeDays(plant, nowMs, fromMultiplier);
  const after = plantAgeDays(plant, nowMs, toMultiplier);
  return addBonusDays(plant, before - after);
}

/** Spult die Pflanze um `days` Pflanzentage vor. */
export function skipPlantDays(plant: PlantRecord, days: number): PlantRecord {
  return days > 0 ? addBonusDays(plant, days) : plant;
}

/** Turbo an oder aus ab `nowMs`. Vergangene Zeit bleibt unverändert. */
export function setTurboScale(plant: PlantRecord, nowMs: number, on: boolean): PlantRecord {
  const scale = on ? TURBO_TIME_SCALE : TIME_SCALE;
  if (currentScale(plant, nowMs) === scale) return plant;
  const kept = plant.scaleSegments.filter((seg) => seg.fromMs < nowMs);
  return { ...plant, scaleSegments: [...kept, { fromMs: nowMs, scale }] };
}

/** Dauer als "h:mm:ss" für die Statusanzeige im Debug-Menü. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Setzt alle Balken auf `level` (zum Zeitpunkt `nowMs`). Koma-Uhr und Twists bleiben unverändert. */
export function setAllNeeds(state: NeedsState, level: number, nowMs: number): NeedsState {
  const values = {} as NeedValues;
  for (const id of NEED_IDS) values[id] = level;
  return { ...state, values, updatedAtMs: nowMs };
}
