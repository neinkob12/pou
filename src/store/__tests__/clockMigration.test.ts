// P27: alte Spielstände mit der monotonen Uhr. Der Höchststand liegt außerhalb des Spielstands
// (eigener Schlüssel), die Spielstand-Form bleibt gleich; alte Stände werden über
// highestTimestampInSave als Startwert der Uhr übernommen.
import { createMonotonicClock, highestTimestampInSave } from '../../game/clock';
import { MS_PER_REAL_DAY } from '../../game/config';
import { applyTurbo, createPlant, getPlantStatus, plantAgeDays } from '../../game/timeEngine';
import { HIGHEST_SEEN_KEY, highestSeenStore, storage } from '../../lib/storage';
import { migrate, SAVE_KEY, useGameStore } from '../gameStore';

const T0 = Date.UTC(2026, 9, 1, 12, 0, 0);
const DEBUG = 1;
const initial = useGameStore.getState();

describe('Höchststand im Speicher', () => {
  beforeEach(() => storage.clearAll());

  it('liest und schreibt den Höchststand unter eigenem Schlüssel', () => {
    expect(highestSeenStore.read()).toBeNull();
    highestSeenStore.write(T0);
    expect(highestSeenStore.read()).toBe(T0);
    expect(storage.getNumber(HIGHEST_SEEN_KEY)).toBe(T0);
    expect(HIGHEST_SEEN_KEY).not.toBe(SAVE_KEY);
  });

  it('übersteht das Zurücksetzen des Spielstands', () => {
    highestSeenStore.write(T0 + MS_PER_REAL_DAY);
    useGameStore.setState(initial, true);
    storage.remove(SAVE_KEY);
    const clock = createMonotonicClock(highestSeenStore, () => T0);
    expect(clock.now()).toBe(T0 + MS_PER_REAL_DAY);
  });
});

describe('Migration alter Spielstände mit der Uhr', () => {
  beforeEach(() => storage.clearAll());

  const plant = applyTurbo(createPlant('gustav', T0, false), T0 + MS_PER_REAL_DAY);
  const needs = { updatedAtMs: T0 + 2 * MS_PER_REAL_DAY, lastCareAtMs: T0 + 2 * MS_PER_REAL_DAY };

  it.each([1, 2])('Version %i: Pflanze rechnet nach der Migration gleich weiter', (version) => {
    const old = version === 1 ? { plant, coins: 5, turbo: true, needs } : { plant, coins: 5, turbo: true, needs, harvestsTotal: 2 };
    const migrated = migrate(old, version) as unknown as { plant: typeof plant };
    const at = T0 + 3 * MS_PER_REAL_DAY;
    expect(getPlantStatus(migrated.plant, at, DEBUG)).toEqual(getPlantStatus(plant, at, DEBUG));
  });

  it('alter Stand ohne gespeicherten Höchststand: Uhr startet beim spätesten Zeitstempel', () => {
    const save = migrate({ plant, coins: 0, turbo: true, needs }, 1);
    // Geräteuhr steht vor dem letzten Spielen.
    const clock = createMonotonicClock(highestSeenStore, () => T0, () => highestTimestampInSave(save));
    const now = clock.now();
    expect(now).toBe(T0 + 2 * MS_PER_REAL_DAY);
    expect(highestSeenStore.read()).toBe(now);
    expect(plantAgeDays(plant, now, DEBUG)).toBeGreaterThan(0);
  });

  it('gespeicherter Höchststand hat Vorrang vor dem Spielstand', () => {
    highestSeenStore.write(T0 + 9 * MS_PER_REAL_DAY);
    const clock = createMonotonicClock(highestSeenStore, () => T0, () => T0 + 2 * MS_PER_REAL_DAY);
    expect(clock.now()).toBe(T0 + 9 * MS_PER_REAL_DAY);
  });
});
