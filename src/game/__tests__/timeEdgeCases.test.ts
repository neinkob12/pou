// Zeit-Kantenfälle (P27): Sommer-/Winterzeit und wochenlange Abwesenheit.
import { createMonotonicClock } from '../clock';
import { MS_PER_REAL_DAY, TIME_SCALE } from '../config';
import { computeNeeds, createNeeds, NO_MODIFIERS } from '../needs';
import { createPlant, flipLight, getPlantStatus, harvest, plantAgeDays } from '../timeEngine';

const HOUR = 60 * 60 * 1000;
const MIN = 60 * 1000;
const DEBUG = 1;

// Zeitumstellungen in Deutschland 2026 (jeweils 01:00 UTC).
const SUMMER_TIME_START = Date.UTC(2026, 2, 29, 1, 0, 0); // 02:00 MEZ -> 03:00 MESZ
const WINTER_TIME_START = Date.UTC(2026, 9, 25, 1, 0, 0); // 03:00 MESZ -> 02:00 MEZ

describe('Sommer-/Winterzeit', () => {
  it('Frühjahr: der Ortstag mit 23 Stunden zählt genau 23 Stunden Wachstum', () => {
    // 28.3. 12:00 MEZ (11:00 UTC) bis 29.3. 12:00 MESZ (10:00 UTC)
    const start = Date.UTC(2026, 2, 28, 11, 0, 0);
    const end = Date.UTC(2026, 2, 29, 10, 0, 0);
    const plant = createPlant('gustav', start, false);
    expect(plantAgeDays(plant, end, DEBUG)).toBeCloseTo((23 / 24) * TIME_SCALE);
  });

  it('Herbst: der Ortstag mit 25 Stunden zählt genau 25 Stunden Wachstum', () => {
    // 24.10. 12:00 MESZ (10:00 UTC) bis 25.10. 12:00 MEZ (11:00 UTC)
    const start = Date.UTC(2026, 9, 24, 10, 0, 0);
    const end = Date.UTC(2026, 9, 25, 11, 0, 0);
    const plant = createPlant('gustav', start, false);
    expect(plantAgeDays(plant, end, DEBUG)).toBeCloseTo((25 / 24) * TIME_SCALE);
  });

  it.each([
    ['Sommerzeit', SUMMER_TIME_START],
    ['Winterzeit', WINTER_TIME_START],
  ])('%s: über die Umstellung steigt das Alter gleichmäßig, die Uhr meldet keinen Rücksprung', (_name, switchMs) => {
    let device = switchMs - 2 * HOUR;
    const store = { v: null as number | null, read: () => store.v, write: (ms: number) => (store.v = ms) };
    const clock = createMonotonicClock(store, () => device);
    const plant = createPlant('gustav', clock.now(), false);
    let lastAge = 0;
    for (let i = 1; i <= 24; i++) {
      device += 10 * MIN;
      const now = clock.now();
      expect(clock.last()?.deviceBehind).toBe(false);
      const age = plantAgeDays(plant, now, DEBUG);
      // Jeder 10-Minuten-Schritt bringt gleich viel Alter, auch über die Umstellung.
      expect(age - lastAge).toBeCloseTo(((10 * MIN) / MS_PER_REAL_DAY) * TIME_SCALE);
      lastAge = age;
    }
  });

  it('hängt nicht von der Zeitzone des Geräts ab', () => {
    const plant = createPlant('gustav', WINTER_TIME_START - 6 * HOUR, false);
    const at = WINTER_TIME_START + 6 * HOUR;
    const before = getPlantStatus(plant, at, DEBUG);
    const oldTz = process.env.TZ;
    try {
      process.env.TZ = 'America/New_York';
      expect(getPlantStatus(plant, at, DEBUG)).toEqual(before);
      process.env.TZ = 'Asia/Tokyo';
      expect(getPlantStatus(plant, at, DEBUG)).toEqual(before);
    } finally {
      process.env.TZ = oldTz;
    }
  });
});

describe('Wochen Abwesenheit', () => {
  const T0 = Date.UTC(2026, 9, 1, 12, 0, 0);
  const weeks = (w: number) => T0 + w * 7 * MS_PER_REAL_DAY;

  it('Pflanze ohne Lichtwechsel bleibt nach 8 Wochen im Wachstum, Werte bleiben endlich', () => {
    const plant = createPlant('gustav', T0, false);
    const s = getPlantStatus(plant, weeks(8), DEBUG);
    expect(s.phase).toBe('vegetative');
    expect(s.phaseProgress).toBe(1);
    expect(s.canFlipLight).toBe(true);
    expect(Number.isFinite(s.ageDays)).toBe(true);
  });

  it('nach dem Lichtwechsel: 6 Wochen weg, dann ist die Pflanze erntereif und wartet', () => {
    const plant = flipLight(createPlant('gustav', T0, false), T0 + 5 * MS_PER_REAL_DAY, DEBUG);
    const s = getPlantStatus(plant, weeks(6), DEBUG);
    expect(s.phase).toBe('ready');
    expect(s.canHarvest).toBe(true);
    expect(s.realMsUntilPhaseEnd).toBeNull();
    // Noch länger weg ändert nichts mehr an der Phase.
    expect(getPlantStatus(plant, weeks(52), DEBUG).phase).toBe('ready');
  });

  it('Autoflower läuft in Abwesenheit bis zur Reife durch', () => {
    const plant = createPlant('anton', T0, false);
    expect(getPlantStatus(plant, weeks(3), DEBUG).phase).toBe('ready');
  });

  it('nach der Ernte: Wochen später ist das Trocknen fertig', () => {
    const flipped = flipLight(createPlant('gustav', T0, false), T0 + 5 * MS_PER_REAL_DAY, DEBUG);
    const harvested = harvest(flipped, T0 + 11 * MS_PER_REAL_DAY, DEBUG);
    expect(harvested.harvestedAtPlantDay).not.toBeNull();
    const s = getPlantStatus(harvested, weeks(10), DEBUG);
    expect(s.phase).toBe('done');
    expect(s.phaseProgress).toBe(1);
  });

  it('Balken fallen in Wochen höchstens auf 0, nie darunter oder auf NaN', () => {
    const needs = computeNeeds(createNeeds(T0), weeks(4), NO_MODIFIERS, 'vegetative');
    for (const v of [needs.water, needs.nutrients, needs.mood]) {
      expect(v).toBe(0);
    }
    expect(needs.hoursSinceCare).toBeCloseTo(4 * 7 * 24);
  });

  it('Balken steigen bei zurückgestellter Uhr nicht über den gespeicherten Stand', () => {
    const state = createNeeds(T0);
    const back = computeNeeds(state, T0 - 3 * MS_PER_REAL_DAY, NO_MODIFIERS, 'vegetative');
    expect(back.water).toBe(state.values.water);
    expect(back.hoursSinceCare).toBe(0);
  });
});
