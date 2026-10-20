import {
  COMA_AFTER_REAL_HOURS,
  MS_PER_REAL_DAY,
  NOTIFICATION_MIN_GAP_MINUTES,
  NOTIFICATION_QUIET_HOURS,
  NOTIFICATIONS_MAX_PER_DAY,
  TIME_SCALE,
} from '../config';
import { createNeeds } from '../needs';
import {
  isQuietTime,
  localDayKey,
  moveOutOfQuietTime,
  planNotifications,
  type PlannedNotification,
} from '../notifications';
import { createPlant, getPlantStatus, type PlantRecord } from '../timeEngine';

const HOUR = 60 * 60 * 1000;
// Ortszeit, damit die Tests in jeder Zeitzone gleich laufen.
const at = (day: number, hour: number, minute = 0) => new Date(2026, 9, day, hour, minute).getTime();

function expectRulesHold(plan: PlannedNotification[], nowMs: number, sentMs: number[] = []) {
  const all = [...sentMs, ...plan.map((n) => n.atMs)];
  for (const n of plan) {
    expect(n.atMs).toBeGreaterThan(nowMs);
    expect(isQuietTime(n.atMs)).toBe(false);
    expect(all.filter((ms) => localDayKey(ms) === localDayKey(n.atMs)).length).toBeLessThanOrEqual(
      NOTIFICATIONS_MAX_PER_DAY,
    );
  }
  const sorted = [...all].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) {
    expect(sorted[i] - sorted[i - 1]).toBeGreaterThanOrEqual(NOTIFICATION_MIN_GAP_MINUTES * 60 * 1000);
  }
  expect(plan.map((n) => n.atMs)).toEqual([...plan.map((n) => n.atMs)].sort((a, b) => a - b));
}

/** Pflanze, die bei `nowMs` genau `ageDays` Pflanzentage alt ist. */
function plantAged(ageDays: number, nowMs: number, extra: Partial<PlantRecord> = {}): PlantRecord {
  const plantedAtMs = nowMs - (ageDays / TIME_SCALE) * MS_PER_REAL_DAY;
  return { ...createPlant('gustav', plantedAtMs, false), ...extra };
}

describe('Ruhezeit', () => {
  it('erkennt 22 bis 9 Uhr als Ruhezeit', () => {
    expect(NOTIFICATION_QUIET_HOURS).toEqual({ startHour: 22, endHour: 9 });
    expect(isQuietTime(at(20, 22))).toBe(true);
    expect(isQuietTime(at(20, 3))).toBe(true);
    expect(isQuietTime(at(20, 8, 59))).toBe(true);
    expect(isQuietTime(at(20, 9))).toBe(false);
    expect(isQuietTime(at(20, 21, 59))).toBe(false);
  });

  it('schiebt auf 9 Uhr am Morgen', () => {
    expect(moveOutOfQuietTime(at(20, 23), at(20, 12))).toBe(at(21, 9));
    expect(moveOutOfQuietTime(at(21, 3), at(20, 12))).toBe(at(21, 9));
    expect(moveOutOfQuietTime(at(20, 15), at(20, 12))).toBe(at(20, 15));
  });

  it('zieht vor, wenn der Morgen zu spät wäre, und verwirft, wenn auch das nicht geht', () => {
    expect(moveOutOfQuietTime(at(21, 3), at(20, 12), at(21, 5))).toBe(at(20, 21, 30));
    expect(moveOutOfQuietTime(at(21, 3), at(20, 22), at(21, 5))).toBeNull();
  });
});

describe('planNotifications', () => {
  it('plant nichts ohne Pflanze', () => {
    const now = at(20, 12);
    expect(planNotifications({ nowMs: now, plant: null, needs: createNeeds(now), sentMs: [] })).toEqual([]);
  });

  it('frische Pflanze: Regeln halten, Koma-Warnung vor dem Koma', () => {
    const now = at(20, 12);
    const plan = planNotifications({
      nowMs: now,
      plant: createPlant('gustav', now, false),
      needs: createNeeds(now),
      sentMs: [],
    });
    expectRulesHold(plan, now);
    const coma = plan.find((n) => n.kind === 'comaWarning');
    expect(coma).toBeDefined();
    expect(coma!.atMs).toBeLessThan(now + COMA_AFTER_REAL_HOURS * HOUR);
  });

  it('meldet Durst, wenn das Wasser tagsüber knapp wird', () => {
    const now = at(20, 9);
    const needs = { ...createNeeds(now), values: { water: 40, nutrients: 100, mood: 100 } };
    const plan = planNotifications({ nowMs: now, plant: plantAged(30, now), needs, sentMs: [] });
    // Wachstum: 5 Punkte pro Stunde, von 40 auf 30 sind 2 Stunden.
    expect(plan.find((n) => n.kind === 'thirsty')?.atMs).toBe(now + 2 * HOUR);
    expectRulesHold(plan, now);
  });

  it('kündigt die Ernte an, wenn die Blüte endet', () => {
    const now = at(20, 12);
    // Licht bei Tag 42 umgeschaltet, Blüte 56 Tage: erntebereit ab Tag 98, jetzt Tag 96.
    const plant = plantAged(96, now, { lightFlipAtPlantDay: 42 });
    expect(getPlantStatus(plant, now).phase).toBe('flowering');
    const plan = planNotifications({ nowMs: now, plant, needs: createNeeds(now), sentMs: [] });
    const ready = plan.find((n) => n.kind === 'harvestReady');
    expect(ready?.atMs).toBeCloseTo(now + (2 / TIME_SCALE) * MS_PER_REAL_DAY, -3);
  });

  it('nennt beim Phasenwechsel die neue Phase', () => {
    const now = at(20, 10);
    // Keimung endet an Tag 7, jetzt Tag 6: in 2,4 Stunden Sämling.
    const plan = planNotifications({ nowMs: now, plant: plantAged(6, now), needs: createNeeds(now), sentMs: [] });
    expect(plan.find((n) => n.kind === 'phaseChanged')?.phase).toBe('seedling');
  });

  it('hält das Tageslimit mit schon zugestellten Benachrichtigungen ein', () => {
    const now = at(20, 14);
    const sentMs = [at(20, 9), at(20, 11), at(20, 13)];
    const needs = { ...createNeeds(now), values: { water: 35, nutrients: 35, mood: 100 } };
    const plan = planNotifications({ nowMs: now, plant: plantAged(30, now), needs, sentMs });
    expect(plan.some((n) => localDayKey(n.atMs) === localDayKey(now))).toBe(false);
    expectRulesHold(plan, now, sentMs);
  });

  it('im Koma oder im Trocknen keine Pflege-Erinnerungen', () => {
    const now = at(20, 12);
    const comaNeeds = createNeeds(now - (COMA_AFTER_REAL_HOURS + 1) * HOUR);
    const inComa = planNotifications({ nowMs: now, plant: plantAged(30, now), needs: comaNeeds, sentMs: [] });
    expect(inComa.filter((n) => n.kind !== 'phaseChanged' && n.kind !== 'harvestReady')).toEqual([]);

    const drying = plantAged(100, now, { lightFlipAtPlantDay: 42, harvestedAtPlantDay: 99 });
    expect(getPlantStatus(drying, now).phase).toBe('drying');
    const plan = planNotifications({ nowMs: now, plant: drying, needs: createNeeds(now), sentMs: [] });
    expect(plan.every((n) => n.kind === 'phaseChanged' && n.phase === 'done')).toBe(true);
  });

  it('hält die Regeln zu jeder Uhrzeit ein', () => {
    for (let hour = 0; hour < 24; hour++) {
      const now = at(20, hour, 17);
      const plan = planNotifications({
        nowMs: now,
        plant: plantAged(30, now),
        needs: createNeeds(now - 10 * HOUR),
        sentMs: [],
      });
      expectRulesHold(plan, now);
    }
  });
});
