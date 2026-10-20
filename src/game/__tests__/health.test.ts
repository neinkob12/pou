import {
  COMA_AFTER_REAL_HOURS,
  COMA_REVIVE_COINS,
  MS_PER_REAL_DAY,
  PEST_BASE_CHANCE_PER_CHECK,
  PEST_MAX_ON_BUDI,
  PEST_NEGLECT_MULTIPLIER,
  PEST_PROTECTION_REAL_HOURS,
  QUALITY_PENALTY_STARS,
} from '../config';
import {
  activeDiseaseCount,
  comaStartsAtMs,
  createHealthState,
  createRng,
  dryingHumidity,
  grantPestProtection,
  isInComa,
  isPestProtected,
  moldChancePerCheck,
  neglectFromNeeds,
  noteCare,
  pestChancePerCheck,
  qualityPenaltyStars,
  removePest,
  reviveCost,
  revive,
  runHealthChecks,
  treatMold,
  type HealthState,
  type Rng,
} from '../health';
import { createPlant, flipLight, harvest, type PlantRecord } from '../timeEngine';

const T0 = Date.UTC(2026, 9, 1, 12, 0, 0);
const HOUR = 60 * 60 * 1000;
const always: Rng = () => 0;
const never: Rng = () => 0.999999;

const started = (atMs = T0): HealthState => ({ ...createHealthState(), lastCheckAtMs: atMs });

/** Gustav, auf 12/12 umgeschaltet und geerntet, damit er ab `dryingStartMs` trocknet. */
function dryingPlant(): { plant: PlantRecord; dryingStartMs: number } {
  let plant = createPlant('gustav', T0, false);
  const flipAt = T0 + 5 * MS_PER_REAL_DAY; // 50 Pflanzentage, Wachstum ab Tag 21 + 21
  plant = flipLight(plant, flipAt);
  const readyAt = flipAt + 6 * MS_PER_REAL_DAY; // 56 Tage Blüte = 5,6 echte Tage
  plant = harvest(plant, readyAt);
  expect(plant.harvestedAtPlantDay).not.toBeNull();
  return { plant, dryingStartMs: readyAt };
}

describe('createRng', () => {
  it('liefert bei gleichem Seed dieselbe Folge in [0, 1)', () => {
    const a = createRng(42);
    const b = createRng(42);
    const xs = Array.from({ length: 50 }, () => a());
    expect(xs).toEqual(Array.from({ length: 50 }, () => b()));
    expect(xs.every((x) => x >= 0 && x < 1)).toBe(true);
    expect(createRng(43)()).not.toBe(xs[0]);
  });
});

describe('Schädlinge', () => {
  const plant = createPlant('gustav', T0, false);

  it('sind bei Vernachlässigung wahrscheinlicher', () => {
    expect(pestChancePerCheck(0)).toBeCloseTo(PEST_BASE_CHANCE_PER_CHECK);
    expect(pestChancePerCheck(1)).toBeCloseTo(PEST_BASE_CHANCE_PER_CHECK * (1 + PEST_NEGLECT_MULTIPLIER));
    expect(pestChancePerCheck(0.5)).toBeGreaterThan(pestChancePerCheck(0.2));
    expect(neglectFromNeeds({ water: 100, nutrients: 100, mood: 100 })).toBe(0);
    expect(neglectFromNeeds({ water: 0, nutrients: 0, mood: 0 })).toBe(1);
  });

  it('erscheinen über viele Seeds bei Vernachlässigung deutlich häufiger', () => {
    const count = (neglect: number) => {
      let total = 0;
      for (let seed = 1; seed <= 200; seed++) {
        const s = runHealthChecks(started(), plant, T0 + 10 * HOUR, createRng(seed), { neglect });
        total += s.pests.length;
      }
      return total / (200 * 10);
    };
    const cared = count(0);
    const neglected = count(1);
    expect(cared).toBeGreaterThan(0.005);
    expect(cared).toBeLessThan(0.04);
    expect(neglected).toBeGreaterThan(cared * 3);
  });

  it('nimmt Vernachlässigung auch als Funktion der Zeit', () => {
    const neglect = jest.fn((atMs: number) => (atMs > T0 + 2 * HOUR ? 1 : 0));
    runHealthChecks(started(), plant, T0 + 4 * HOUR, never, { neglect });
    expect(neglect.mock.calls.map(([t]) => (t - T0) / HOUR)).toEqual([1, 2, 3, 4]);
  });

  it('würfelt nur abgeschlossene Fenster, egal wie oft geprüft wird', () => {
    const once = runHealthChecks(started(), plant, T0 + 30 * HOUR, createRng(7), { neglect: 1 });
    const rng = createRng(7);
    let stepwise = started();
    for (let h = 1; h <= 60; h++) {
      stepwise = runHealthChecks(stepwise, plant, T0 + h * HOUR * 0.5, rng, { neglect: 1 });
    }
    expect(stepwise).toEqual(once);
    expect(once.pests.length).toBeGreaterThan(0);
    expect(runHealthChecks(started(), plant, T0 + HOUR - 1, always, { neglect: 1 }).pests).toEqual([]);
  });

  it('startet beim ersten Check ohne rückwirkende Würfe', () => {
    const s = runHealthChecks(createHealthState(), plant, T0 + 5 * HOUR, always, { neglect: 1 });
    expect(s.pests).toEqual([]);
    expect(s.lastCheckAtMs).toBe(T0 + 5 * HOUR);
  });

  it('sitzen höchstens PEST_MAX_ON_BUDI auf Budi und lassen sich wegtippen', () => {
    const s = runHealthChecks(started(), plant, T0 + 20 * HOUR, always, { neglect: 1 });
    expect(s.pests).toHaveLength(PEST_MAX_ON_BUDI);
    expect(new Set(s.pests.map((p) => p.id)).size).toBe(PEST_MAX_ON_BUDI);
    const removed = removePest(s, s.pests[0].id);
    expect(removed.pests).toHaveLength(PEST_MAX_ON_BUDI - 1);
    expect(removePest(removed, 'gibt-es-nicht')).toBe(removed);
  });

  it('kennen beide Arten', () => {
    const kinds = new Set<string>();
    for (let seed = 1; seed <= 50; seed++) {
      runHealthChecks(started(), plant, T0 + 48 * HOUR, createRng(seed), { neglect: 1 }).pests.forEach((p) =>
        kinds.add(p.kind),
      );
    }
    expect([...kinds].sort()).toEqual(['fungusGnat', 'spiderMite']);
  });

  it('erscheinen mit Nützlings-Multiplikator 0 nie', () => {
    const s = runHealthChecks(started(), plant, T0 + 20 * HOUR, always, { neglect: 1, pestChanceMultiplier: 0 });
    expect(s.pests).toEqual([]);
  });

  it('erscheinen nicht beim Trocknen', () => {
    const { plant: dry, dryingStartMs } = dryingPlant();
    const s = runHealthChecks(started(dryingStartMs), dry, dryingStartMs + 10 * HOUR, always, { neglect: 1 });
    expect(s.pests).toEqual([]);
  });
});

describe('Schädlingsschutz', () => {
  const plant = createPlant('gustav', T0, false);

  it('verhindert neue Schädlinge bis zum Ablaufzeitstempel', () => {
    const protectedState = grantPestProtection(started(), T0);
    expect(protectedState.pestProtectionUntilMs).toBe(T0 + PEST_PROTECTION_REAL_HOURS * HOUR);
    expect(isPestProtected(protectedState, T0 + 23 * HOUR)).toBe(true);
    expect(isPestProtected(protectedState, T0 + 24 * HOUR)).toBe(false);

    const during = runHealthChecks(protectedState, plant, T0 + 24 * HOUR, always, { neglect: 1 });
    expect(during.pests).toEqual([]);
    const after = runHealthChecks(during, plant, T0 + 25 * HOUR, always, { neglect: 1 });
    expect(after.pests).toHaveLength(1);
    expect(after.pests[0].spawnedAtMs).toBe(T0 + 25 * HOUR);
  });

  it('wird nie verkürzt, nur verlängert', () => {
    const long = grantPestProtection(started(), T0, 48 * HOUR);
    expect(grantPestProtection(long, T0 + HOUR, HOUR)).toEqual(long);
    expect(grantPestProtection(long, T0 + 40 * HOUR).pestProtectionUntilMs).toBe(T0 + 64 * HOUR);
  });
});

describe('Schimmel beim Trocknen', () => {
  const { plant, dryingStartMs } = dryingPlant();

  it('entsteht nur über der Feuchte-Schwelle, also nicht mit Entfeuchter', () => {
    expect(moldChancePerCheck(dryingHumidity(false))).toBeGreaterThan(0);
    expect(moldChancePerCheck(dryingHumidity(true))).toBe(0);
    const without = runHealthChecks(started(dryingStartMs), plant, dryingStartMs + 3 * HOUR, always, { neglect: 0 });
    expect(without.moldSinceMs).toBe(dryingStartMs + HOUR);
    const withDehumidifier = runHealthChecks(started(dryingStartMs), plant, dryingStartMs + 3 * HOUR, always, {
      neglect: 0,
      hasDehumidifier: true,
    });
    expect(withDehumidifier.moldSinceMs).toBeNull();
  });

  it('tritt beim Trocknen ohne Entfeuchter in einem Teil der Fälle auf', () => {
    let molded = 0;
    for (let seed = 1; seed <= 200; seed++) {
      const s = runHealthChecks(started(dryingStartMs), plant, dryingStartMs + 17 * HOUR, createRng(seed), {
        neglect: 0,
      });
      if (s.moldSinceMs !== null) molded++;
    }
    expect(molded).toBeGreaterThan(30);
    expect(molded).toBeLessThan(140);
  });

  it('entsteht nicht während des Wachstums', () => {
    const growing = createPlant('gustav', T0, false);
    expect(runHealthChecks(started(), growing, T0 + 10 * HOUR, always, { neglect: 0 }).moldSinceMs).toBeNull();
  });

  it('bleibt bis zur Behandlung', () => {
    const s = runHealthChecks(started(dryingStartMs), plant, dryingStartMs + 3 * HOUR, always, { neglect: 0 });
    expect(treatMold(s).moldSinceMs).toBeNull();
    expect(treatMold(treatMold(s))).toEqual(treatMold(s));
  });
});

describe('Koma', () => {
  const plant = createPlant('gustav', T0, false);
  const comaMs = COMA_AFTER_REAL_HOURS * HOUR;

  it('beginnt COMA_AFTER_REAL_HOURS nach dem Pflanzen ohne Pflege', () => {
    const s = createHealthState();
    expect(comaStartsAtMs(s, plant)).toBe(T0 + comaMs);
    expect(isInComa(s, plant, T0 + comaMs - 1)).toBe(false);
    expect(isInComa(s, plant, T0 + comaMs)).toBe(true);
  });

  it('wird durch Pflege nach hinten geschoben', () => {
    const cared = noteCare(createHealthState(), T0 + 10 * HOUR);
    expect(isInComa(cared, plant, T0 + comaMs)).toBe(false);
    expect(isInComa(cared, plant, T0 + 10 * HOUR + comaMs)).toBe(true);
    expect(noteCare(cared, T0)).toBe(cared);
  });

  it('endet mit Wiederbeleben gegen feste Kosten', () => {
    expect(reviveCost()).toBe(COMA_REVIVE_COINS);
    const at = T0 + 3 * comaMs;
    const revived = revive(createHealthState(), at);
    expect(isInComa(revived, plant, at)).toBe(false);
    expect(revived.revives).toBe(1);
    expect(isInComa(revived, plant, at + comaMs)).toBe(true);
  });

  it('gibt es beim Trocknen nicht', () => {
    const { plant: dry, dryingStartMs } = dryingPlant();
    expect(isInComa(createHealthState(), dry, dryingStartMs + HOUR)).toBe(false);
  });
});

describe('Qualitätsmalus', () => {
  const plant = createPlant('gustav', T0, false);

  it('ist 0 bei gesunder Pflanze', () => {
    expect(qualityPenaltyStars(createHealthState())).toBe(0);
    expect(activeDiseaseCount(createHealthState())).toBe(0);
  });

  it('steigt je Schädling und mit Schimmel, gedeckelt, und fällt nach dem Beheben', () => {
    const two = runHealthChecks(started(), plant, T0 + 2 * HOUR, always, { neglect: 1 });
    expect(qualityPenaltyStars(two)).toBeCloseTo(2 * QUALITY_PENALTY_STARS.perPest);
    const withMold: HealthState = { ...two, moldSinceMs: T0 };
    expect(activeDiseaseCount(withMold)).toBe(3);
    expect(qualityPenaltyStars(withMold)).toBeCloseTo(2 * QUALITY_PENALTY_STARS.perPest + QUALITY_PENALTY_STARS.mold);
    const full = runHealthChecks(started(), plant, T0 + 20 * HOUR, always, { neglect: 1 });
    expect(qualityPenaltyStars({ ...full, moldSinceMs: T0 })).toBeLessThanOrEqual(QUALITY_PENALTY_STARS.max);
    const cleared = two.pests.reduce((s, p) => removePest(s, p.id), two);
    expect(qualityPenaltyStars(cleared)).toBe(0);
  });
});
