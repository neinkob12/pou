// PotPou Spieluhr: monotone Zeit aus der Geräteuhr.
// Die Geräteuhr kann zurückgestellt werden (von Hand, Zeitzone, Sync-Fehler). Damit das
// Pflanzenalter nie sinkt, merkt sich die Uhr den höchsten je gesehenen Zeitstempel und liefert
// nie weniger. Sommer-/Winterzeit betrifft nur die Anzeige der Ortszeit, nicht den Zeitstempel
// (Millisekunden seit 1970 UTC); hier wird deshalb nie mit Ortszeit gerechnet.
// Reines TypeScript: Der Speicher wird von außen übergeben (siehe highestSeenStore in src/lib/storage.ts).

import type { PlantRecord } from './timeEngine';

export interface ClockReading {
  /** Spielzeit: nie kleiner als ein früher gelieferter Wert. */
  nowMs: number;
  /** Neuer höchster gesehener Zeitstempel (zum Speichern). */
  highestSeenMs: number;
  /** true, wenn die Geräteuhr hinter dem höchsten gesehenen Zeitstempel steht. */
  deviceBehind: boolean;
}

function isUsableMs(ms: number | null | undefined): ms is number {
  return typeof ms === 'number' && Number.isFinite(ms) && ms >= 0;
}

/** Ein Schritt der Uhr: aus gespeichertem Höchststand und Gerätezeit die Spielzeit bilden. */
export function advanceClock(highestSeenMs: number | null, deviceNowMs: number): ClockReading {
  const highest = isUsableMs(highestSeenMs) ? highestSeenMs : null;
  const device = isUsableMs(deviceNowMs) ? deviceNowMs : null;
  if (device === null) {
    // Kaputte Gerätezeit: beim letzten guten Stand bleiben.
    const fallback = highest ?? 0;
    return { nowMs: fallback, highestSeenMs: fallback, deviceBehind: highest !== null };
  }
  if (highest === null || device >= highest) {
    return { nowMs: device, highestSeenMs: device, deviceBehind: false };
  }
  return { nowMs: highest, highestSeenMs: highest, deviceBehind: true };
}

/**
 * Höchster Zeitstempel in einem (evtl. alten) Spielstand. Startwert für die Uhr, wenn noch kein
 * Höchststand gespeichert ist, etwa beim ersten Start nach dem Update.
 */
export function highestTimestampInSave(save: unknown): number | null {
  if (!save || typeof save !== 'object') return null;
  const s = save as { plant?: Partial<PlantRecord> | null; needs?: Record<string, unknown> | null };
  const candidates: unknown[] = [];
  if (s.plant && typeof s.plant === 'object') {
    candidates.push(s.plant.plantedAtMs);
    if (Array.isArray(s.plant.scaleSegments)) {
      for (const seg of s.plant.scaleSegments) candidates.push(seg?.fromMs);
    }
  }
  if (s.needs && typeof s.needs === 'object') {
    candidates.push(s.needs.updatedAtMs, s.needs.lastCareAtMs);
  }
  let best: number | null = null;
  for (const c of candidates) {
    if (typeof c === 'number' && isUsableMs(c) && (best === null || c > best)) best = c;
  }
  return best;
}

/** Wo der Höchststand liegt. Fehler beim Schreiben (z. B. Speicher voll) bricht die Uhr nicht. */
export interface HighestSeenStore {
  read: () => number | null;
  write: (ms: number) => void;
}

export interface MonotonicClock {
  /** Aktuelle Spielzeit in ms. Steigt oder bleibt gleich, sinkt nie. */
  now: () => number;
  /** Letzte Ablesung, z. B. für einen Hinweis "Geräteuhr steht zurück". */
  last: () => ClockReading | null;
}

/**
 * Uhr mit gespeichertem Höchststand. `seed` liefert einen Startwert, falls der Speicher leer ist
 * (z. B. highestTimestampInSave des geladenen Spielstands).
 */
export function createMonotonicClock(
  store: HighestSeenStore,
  deviceNow: () => number = Date.now,
  seed: () => number | null = () => null,
): MonotonicClock {
  let highest: number | null = null;
  let persisted: number | null = null;
  let loaded = false;
  let lastReading: ClockReading | null = null;

  const load = () => {
    if (loaded) return;
    loaded = true;
    let stored: number | null = null;
    try {
      stored = store.read();
    } catch {
      stored = null;
    }
    persisted = isUsableMs(stored) ? stored : null;
    highest = persisted ?? seed();
  };

  return {
    now: () => {
      load();
      const reading = advanceClock(highest, deviceNow());
      highest = reading.highestSeenMs;
      if (reading.highestSeenMs !== persisted) {
        try {
          store.write(reading.highestSeenMs);
          persisted = reading.highestSeenMs;
        } catch {
          // Speicher voll oder gesperrt: im Speicher weiterzählen, beim nächsten Mal erneut schreiben.
        }
      }
      lastReading = reading;
      return reading.nowMs;
    },
    last: () => lastReading,
  };
}
