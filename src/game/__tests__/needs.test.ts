import {
  CARE_AMOUNTS,
  COMA_AFTER_REAL_HOURS,
  COMA_REVIVE_NEED_LEVEL,
  NEED_DECAY_PER_REAL_HOUR,
  NEED_START,
  NEED_THRESHOLDS,
  OVERWATER_STRESS_REAL_HOURS,
  WRONG_FERTILIZER_FACTOR,
  WRONG_FERTILIZER_STRESS_REAL_HOURS,
  type PhaseId,
} from '../config';
import {
  applyCare,
  applyMoodPenalty,
  computeNeeds,
  createNeeds,
  deriveCondition,
  isInComa,
  isRightFertilizer,
  NO_MODIFIERS,
  reviveNeeds,
  type NeedsSnapshot,
} from '../needs';

const T0 = Date.UTC(2026, 9, 1, 12, 0, 0);
const HOUR = 60 * 60 * 1000;
const hours = (h: number) => T0 + h * HOUR;
const VEG: PhaseId = 'vegetative';

const snapshot = (over: Partial<NeedsSnapshot> = {}): NeedsSnapshot => ({
  water: 80,
  nutrients: 80,
  mood: 80,
  hoursSinceCare: 1,
  overwatered: false,
  wrongFertilizer: false,
  ...over,
});

describe('needs: Abfall aus Zeitstempeln', () => {
  it('startet mit den Startwerten', () => {
    const n = computeNeeds(createNeeds(T0), T0, NO_MODIFIERS, VEG);
    expect(n.water).toBe(NEED_START.water);
    expect(n.nutrients).toBe(NEED_START.nutrients);
    expect(n.mood).toBe(NEED_START.mood);
    expect(n.hoursSinceCare).toBe(0);
  });

  it('sinkt pro echter Stunde laut config', () => {
    const n = computeNeeds(createNeeds(T0), hours(10), NO_MODIFIERS, VEG);
    expect(n.water).toBeCloseTo(NEED_START.water - 10 * NEED_DECAY_PER_REAL_HOUR.water);
    expect(n.nutrients).toBeCloseTo(NEED_START.nutrients - 10 * NEED_DECAY_PER_REAL_HOUR.nutrients);
    expect(n.mood).toBeCloseTo(NEED_START.mood - 10 * NEED_DECAY_PER_REAL_HOUR.mood);
  });

  it('steht nach Tagen Abwesenheit auf 0, nie darunter, und meldet die Stunden ohne Pflege', () => {
    const n = computeNeeds(createNeeds(T0), hours(3 * 24), NO_MODIFIERS, VEG);
    expect(n.water).toBe(0);
    expect(n.nutrients).toBe(0);
    expect(n.mood).toBe(0);
    expect(n.hoursSinceCare).toBeCloseTo(72);
  });

  it('ändert nichts, wenn die Uhr vor dem letzten Stand liegt', () => {
    const n = computeNeeds(createNeeds(T0), hours(-5), NO_MODIFIERS, VEG);
    expect(n.water).toBe(NEED_START.water);
    expect(n.hoursSinceCare).toBe(0);
  });

  it('wendet Abfall-Multiplikatoren je Balken an (Shop-Effekte)', () => {
    const n = computeNeeds(createNeeds(T0), hours(10), { water: 0.5 }, VEG);
    expect(n.water).toBeCloseTo(NEED_START.water - 5 * NEED_DECAY_PER_REAL_HOUR.water);
    expect(n.nutrients).toBeCloseTo(NEED_START.nutrients - 10 * NEED_DECAY_PER_REAL_HOUR.nutrients);
  });

  it('Sämling verliert langsamer Wasser', () => {
    const seedling = computeNeeds(createNeeds(T0), hours(10), NO_MODIFIERS, 'seedling');
    const veg = computeNeeds(createNeeds(T0), hours(10), NO_MODIFIERS, VEG);
    expect(seedling.water).toBeGreaterThan(veg.water);
    expect(seedling.nutrients).toBeCloseTo(veg.nutrients);
  });

  it('hat im Trocknen keinen Abfall mehr', () => {
    const n = computeNeeds(createNeeds(T0), hours(48), NO_MODIFIERS, 'drying');
    expect(n.water).toBe(NEED_START.water);
  });
});

describe('needs: Pflege und Phasen-Twists', () => {
  it('gießen füllt Wasser auf, setzt die Pflegezeit und verändert den alten Zustand nicht', () => {
    const s = createNeeds(T0);
    const after = applyCare(s, { type: 'water', phase: VEG }, hours(10));
    const n = computeNeeds(after, hours(10), NO_MODIFIERS, VEG);
    expect(n.water).toBeCloseTo(NEED_START.water - 50 + CARE_AMOUNTS.water);
    expect(n.hoursSinceCare).toBe(0);
    expect(n.overwatered).toBe(false);
    expect(s.values.water).toBe(NEED_START.water);
  });

  it('Gießen über 100 macht Überwässerung, die nach einigen Stunden abklingt', () => {
    const after = applyCare(createNeeds(T0), { type: 'water', phase: VEG }, T0);
    const n = computeNeeds(after, T0, NO_MODIFIERS, VEG);
    expect(n.water).toBe(100);
    expect(n.overwatered).toBe(true);
    expect(deriveCondition(n, VEG)).toBe('stressed');
    const later = computeNeeds(after, hours(OVERWATER_STRESS_REAL_HOURS), NO_MODIFIERS, VEG);
    expect(later.overwatered).toBe(false);
  });

  it('Sämling wird schon unter 100 überwässert', () => {
    const s = createNeeds(T0);
    const at = hours(5); // Wasser 80 - 12,5 = 67,5; +35 liegt über dem Sämlings-Limit
    expect(computeNeeds(applyCare(s, { type: 'water', phase: 'seedling' }, at), at, NO_MODIFIERS, 'seedling').overwatered).toBe(true);
    const vegAt = hours(5); // gleiche Menge im Wachstum: 55 + 35 = 90, kein Problem
    expect(computeNeeds(applyCare(s, { type: 'water', phase: VEG }, vegAt), vegAt, NO_MODIFIERS, VEG).overwatered).toBe(false);
  });

  it('Stickstoff-Dünger passt im Wachstum, Phosphor/Kalium in der Blüte, Universaldünger immer', () => {
    expect(isRightFertilizer('fertilizeGrow', 'vegetative')).toBe(true);
    expect(isRightFertilizer('fertilizeGrow', 'flowering')).toBe(false);
    expect(isRightFertilizer('fertilizeBloom', 'flowering')).toBe(true);
    expect(isRightFertilizer('fertilizeBloom', 'vegetative')).toBe(false);
    expect(isRightFertilizer('fertilize', 'flowering')).toBe(true);
    expect(isRightFertilizer('fertilize', 'seedling')).toBe(true);
  });

  it('richtiger Dünger füllt voll auf', () => {
    const at = hours(10);
    const after = applyCare(createNeeds(T0), { type: 'fertilizeBloom', phase: 'flowering' }, at);
    const n = computeNeeds(after, at, NO_MODIFIERS, 'flowering');
    expect(n.nutrients).toBeCloseTo(50 + CARE_AMOUNTS.fertilizeBloom);
    expect(n.wrongFertilizer).toBe(false);
  });

  it('falscher Dünger wirkt kaum und stresst Budi eine Weile', () => {
    const at = hours(10);
    const after = applyCare(createNeeds(T0), { type: 'fertilizeGrow', phase: 'flowering' }, at);
    const n = computeNeeds(after, at, NO_MODIFIERS, 'flowering');
    expect(n.nutrients).toBeCloseTo(50 + CARE_AMOUNTS.fertilizeGrow * WRONG_FERTILIZER_FACTOR);
    expect(n.wrongFertilizer).toBe(true);
    expect(deriveCondition(n, 'flowering')).toBe('stressed');
    const later = computeNeeds(after, at + WRONG_FERTILIZER_STRESS_REAL_HOURS * HOUR, NO_MODIFIERS, 'flowering');
    expect(later.wrongFertilizer).toBe(false);
  });

  it('streicheln hebt die Laune, eine eigene Menge (Minigame) geht vor', () => {
    const at = hours(10);
    const petted = computeNeeds(applyCare(createNeeds(T0), { type: 'pet', phase: VEG }, at), at, NO_MODIFIERS, VEG);
    expect(petted.mood).toBeCloseTo(40 + CARE_AMOUNTS.pet);
    const custom = applyCare(createNeeds(T0), { type: 'pet', phase: VEG, amount: 5 }, at);
    expect(computeNeeds(custom, at, NO_MODIFIERS, VEG).mood).toBeCloseTo(45);
  });

  it('Pflege rechnet den Abfall bis jetzt mit den Modifikatoren ein', () => {
    const at = hours(10);
    const after = applyCare(createNeeds(T0), { type: 'pet', phase: VEG }, at, { water: 0 });
    expect(after.values.water).toBe(NEED_START.water);
  });
});

describe('needs: Koma', () => {
  it('Koma beginnt genau nach COMA_AFTER_REAL_HOURS ohne Pflege', () => {
    const s = createNeeds(T0);
    expect(isInComa(s, hours(COMA_AFTER_REAL_HOURS) - 1)).toBe(false);
    expect(isInComa(s, hours(COMA_AFTER_REAL_HOURS))).toBe(true);
  });

  it('im Koma wirkt Pflege nicht, Wiederbeleben setzt alles zurück', () => {
    const s = createNeeds(T0);
    const at = hours(COMA_AFTER_REAL_HOURS + 1);
    expect(applyCare(s, { type: 'water', phase: VEG }, at)).toBe(s);
    const revived = reviveNeeds(at);
    const n = computeNeeds(revived, at, NO_MODIFIERS, VEG);
    expect(n.water).toBe(COMA_REVIVE_NEED_LEVEL);
    expect(deriveCondition(n, VEG)).toBe('ok');
    expect(isInComa(revived, at)).toBe(false);
  });

  it('Pflege kurz vor der Schwelle verhindert das Koma', () => {
    const cared = applyCare(createNeeds(T0), { type: 'pet', phase: VEG }, hours(23));
    expect(isInComa(cared, hours(30))).toBe(false);
  });
});

describe('needs: applyMoodPenalty', () => {
  it('senkt nur die Laune, zählt nicht als Pflege', () => {
    const s = createNeeds(T0);
    const after = applyMoodPenalty(s, 10, 'flowering', hours(1));
    const n = computeNeeds(after, hours(1), NO_MODIFIERS, 'flowering');
    expect(n.mood).toBeCloseTo(NEED_START.mood - NEED_DECAY_PER_REAL_HOUR.mood - 10);
    expect(n.water).toBeCloseTo(NEED_START.water - NEED_DECAY_PER_REAL_HOUR.water);
    expect(after.lastCareAtMs).toBe(T0);
    expect(after.updatedAtMs).toBe(hours(1));
    expect(s.values.mood).toBe(NEED_START.mood);
  });

  it('schützt nicht vor dem Koma und wirkt im Koma nicht', () => {
    const after = applyMoodPenalty(createNeeds(T0), 10, 'flowering', hours(23));
    expect(isInComa(after, hours(COMA_AFTER_REAL_HOURS))).toBe(true);
    const comatose = createNeeds(T0);
    expect(applyMoodPenalty(comatose, 10, 'flowering', hours(COMA_AFTER_REAL_HOURS))).toBe(comatose);
  });

  it('Laune fällt nicht unter 0', () => {
    const after = applyMoodPenalty(createNeeds(T0), 500, 'flowering', T0);
    expect(after.values.mood).toBe(0);
  });
});

describe('needs: deriveCondition', () => {
  const { low, critical } = NEED_THRESHOLDS;

  it('ok bei vollen Balken', () => {
    expect(deriveCondition(snapshot(), VEG)).toBe('ok');
  });

  it('durstig, wenn Wasser niedrig ist', () => {
    expect(deriveCondition(snapshot({ water: low }), VEG)).toBe('thirsty');
  });

  it('hungrig, wenn Nährstoffe niedrig sind', () => {
    expect(deriveCondition(snapshot({ nutrients: low }), VEG)).toBe('hungry');
  });

  it('gestresst bei schlechter Laune, Überwässerung oder falschem Dünger', () => {
    expect(deriveCondition(snapshot({ mood: low }), VEG)).toBe('stressed');
    expect(deriveCondition(snapshot({ overwatered: true }), VEG)).toBe('stressed');
    expect(deriveCondition(snapshot({ wrongFertilizer: true }), VEG)).toBe('stressed');
  });

  it('krank, sobald ein Balken kritisch ist, auch vor durstig', () => {
    expect(deriveCondition(snapshot({ water: critical }), VEG)).toBe('sick');
    expect(deriveCondition(snapshot({ mood: 0, water: low }), VEG)).toBe('sick');
  });

  it('Koma ab der Schwelle, vor allem anderen', () => {
    expect(deriveCondition(snapshot({ hoursSinceCare: COMA_AFTER_REAL_HOURS - 0.01, water: 0 }), VEG)).toBe('sick');
    expect(deriveCondition(snapshot({ hoursSinceCare: COMA_AFTER_REAL_HOURS, water: 0 }), VEG)).toBe('coma');
  });

  it('nach Tagen Abwesenheit liegt Budi im Koma', () => {
    const n = computeNeeds(createNeeds(T0), hours(3 * 24), NO_MODIFIERS, VEG);
    expect(deriveCondition(n, VEG)).toBe('coma');
  });

  it('nach rund 18 Stunden ohne Wasser ist Budi krank, aber noch nicht im Koma', () => {
    const n = computeNeeds(createNeeds(T0), hours(18), NO_MODIFIERS, VEG);
    expect(deriveCondition(n, VEG)).toBe('sick');
  });

  it('im Trocknen und danach gibt es keine Bedürfnisse', () => {
    const bad = snapshot({ water: 0, hoursSinceCare: 100 });
    expect(deriveCondition(bad, 'drying')).toBe('ok');
    expect(deriveCondition(bad, 'done')).toBe('ok');
  });
});
