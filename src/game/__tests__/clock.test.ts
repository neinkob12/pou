import { advanceClock, createMonotonicClock, highestTimestampInSave, type HighestSeenStore } from '../clock';
import { MS_PER_REAL_DAY } from '../config';
import { applyTurbo, createPlant, getPlantStatus, plantAgeDays, segmentStartMs } from '../timeEngine';

const T0 = Date.UTC(2026, 9, 1, 12, 0, 0);
const HOUR = 60 * 60 * 1000;
const DEBUG = 1;

function memoryStore(initial: number | null = null): HighestSeenStore & { value: number | null } {
  const s = {
    value: initial,
    read: () => s.value,
    write: (ms: number) => {
      s.value = ms;
    },
  };
  return s;
}

/** Uhr, deren Gerätezeit der Test von Hand stellt. */
function deviceClock(start: number) {
  const d = { ms: start, now: () => d.ms };
  return d;
}

describe('advanceClock', () => {
  it('übernimmt die Gerätezeit, wenn sie vorwärts läuft', () => {
    expect(advanceClock(T0, T0 + HOUR)).toEqual({ nowMs: T0 + HOUR, highestSeenMs: T0 + HOUR, deviceBehind: false });
  });

  it('bleibt beim Höchststand, wenn die Geräteuhr zurückgestellt wurde', () => {
    expect(advanceClock(T0, T0 - MS_PER_REAL_DAY)).toEqual({ nowMs: T0, highestSeenMs: T0, deviceBehind: true });
  });

  it('startet ohne Höchststand mit der Gerätezeit', () => {
    expect(advanceClock(null, T0).nowMs).toBe(T0);
  });

  it('ignoriert kaputte Werte (NaN, negativ, unendlich)', () => {
    expect(advanceClock(T0, Number.NaN).nowMs).toBe(T0);
    expect(advanceClock(T0, -5).nowMs).toBe(T0);
    expect(advanceClock(Number.POSITIVE_INFINITY, T0).nowMs).toBe(T0);
    expect(advanceClock(null, Number.NaN).nowMs).toBe(0);
  });
});

describe('createMonotonicClock', () => {
  it('liefert nie einen kleineren Wert, auch wenn die Geräteuhr springt', () => {
    const device = deviceClock(T0);
    const clock = createMonotonicClock(memoryStore(), device.now);
    const jumps = [0, HOUR, -3 * HOUR, -30 * MS_PER_REAL_DAY, 2 * HOUR, -1, 5 * HOUR];
    let last = -Infinity;
    for (const j of jumps) {
      device.ms = T0 + j;
      const now = clock.now();
      expect(now).toBeGreaterThanOrEqual(last);
      last = now;
    }
    expect(last).toBe(T0 + 5 * HOUR);
  });

  it('speichert den Höchststand und übersteht einen Neustart mit zurückgestellter Uhr', () => {
    const store = memoryStore();
    const device = deviceClock(T0 + 10 * MS_PER_REAL_DAY);
    createMonotonicClock(store, device.now).now();
    expect(store.value).toBe(T0 + 10 * MS_PER_REAL_DAY);

    // App neu gestartet, Uhr 5 Tage zurück.
    device.ms = T0 + 5 * MS_PER_REAL_DAY;
    const restarted = createMonotonicClock(store, device.now);
    expect(restarted.now()).toBe(T0 + 10 * MS_PER_REAL_DAY);
    expect(restarted.last()?.deviceBehind).toBe(true);
  });

  it('nimmt den Startwert aus dem Spielstand, wenn noch kein Höchststand gespeichert ist', () => {
    const store = memoryStore();
    const device = deviceClock(T0);
    const clock = createMonotonicClock(store, device.now, () => T0 + MS_PER_REAL_DAY);
    expect(clock.now()).toBe(T0 + MS_PER_REAL_DAY);
    expect(store.value).toBe(T0 + MS_PER_REAL_DAY);
  });

  it('läuft weiter, wenn der Speicher voll ist, und schreibt später nach', () => {
    let full = true;
    const store = memoryStore();
    const failing: HighestSeenStore = {
      read: () => {
        if (full) throw new Error('lesen fehlgeschlagen');
        return store.read();
      },
      write: (ms) => {
        if (full) throw new Error('Speicher voll');
        store.write(ms);
      },
    };
    const device = deviceClock(T0);
    const clock = createMonotonicClock(failing, device.now);
    expect(clock.now()).toBe(T0);
    device.ms = T0 - HOUR;
    expect(clock.now()).toBe(T0);
    full = false;
    clock.now();
    expect(store.value).toBe(T0);
  });
});

describe('Pflanzenalter mit zurückgestellter Gerätezeit', () => {
  it('sinkt nie, auch wenn die Geräteuhr mehrfach zurückgestellt wird', () => {
    const device = deviceClock(T0);
    const clock = createMonotonicClock(memoryStore(), device.now);
    const plant = createPlant('gustav', clock.now(), false);
    const steps = [6 * HOUR, -2 * MS_PER_REAL_DAY, 12 * HOUR, -1 * HOUR, 3 * MS_PER_REAL_DAY, -7 * MS_PER_REAL_DAY];
    let lastAge = 0;
    for (const s of steps) {
      device.ms += s;
      const age = plantAgeDays(plant, clock.now(), DEBUG);
      expect(age).toBeGreaterThanOrEqual(lastAge);
      lastAge = age;
    }
  });

  it('ohne Uhr: Gerätezeit vor dem Pflanzen ergibt Alter 0, nie negativ', () => {
    const plant = createPlant('gustav', T0, false);
    expect(plantAgeDays(plant, T0 - 3 * MS_PER_REAL_DAY, DEBUG)).toBe(0);
    expect(getPlantStatus(plant, T0 - 3 * MS_PER_REAL_DAY, DEBUG).phase).toBe('germination');
  });

  it('Turbo bei zurückgestellter Uhr hält die Segmente sortiert und zählt keine Zeit doppelt', () => {
    let plant = createPlant('gustav', T0, false);
    plant = applyTurbo(plant, T0 + MS_PER_REAL_DAY);
    // Turbo aus (wie im Debug-Menü) und dann bei zurückgestellter Uhr wieder an.
    plant = { ...plant, scaleSegments: [...plant.scaleSegments, { fromMs: T0 + 2 * MS_PER_REAL_DAY, scale: 10 }] };
    const rolledBack = T0 + 1.5 * MS_PER_REAL_DAY;
    expect(segmentStartMs(plant, rolledBack)).toBe(T0 + 2 * MS_PER_REAL_DAY);
    plant = applyTurbo(plant, T0 + 2.5 * MS_PER_REAL_DAY);
    const froms = plant.scaleSegments.map((s) => s.fromMs);
    expect([...froms].sort((a, b) => a - b)).toEqual(froms);

    const p2 = applyTurbo(
      { ...createPlant('gustav', T0, false), scaleSegments: [{ fromMs: T0, scale: 10 }, { fromMs: T0 + MS_PER_REAL_DAY, scale: 10 }] },
      T0 + 0.5 * MS_PER_REAL_DAY,
    );
    // Neues Segment beginnt am letzten, nicht in der Vergangenheit.
    expect(p2.scaleSegments[2].fromMs).toBe(T0 + MS_PER_REAL_DAY);
    // 1 Tag x10 + 1 Tag x20 = 30 Pflanzentage, nichts doppelt.
    expect(plantAgeDays(p2, T0 + 2 * MS_PER_REAL_DAY, DEBUG)).toBeCloseTo(30);
  });
});

describe('highestTimestampInSave', () => {
  it('findet den spätesten Zeitstempel aus Pflanze und Balken', () => {
    const plant = applyTurbo(createPlant('gustav', T0, false), T0 + 2 * HOUR);
    const save = { plant, needs: { updatedAtMs: T0 + HOUR, lastCareAtMs: T0 + 3 * HOUR } };
    expect(highestTimestampInSave(save)).toBe(T0 + 3 * HOUR);
  });

  it('liefert null für leere oder kaputte Spielstände', () => {
    expect(highestTimestampInSave(null)).toBeNull();
    expect(highestTimestampInSave({})).toBeNull();
    expect(highestTimestampInSave({ plant: { plantedAtMs: 'gestern' }, needs: null })).toBeNull();
  });
});
