import { MINIGAME_REWARDS, NEED_START } from '../../../../game/config';
import { applyCare, createNeeds } from '../../../../game/needs';
import { createPlant } from '../../../../game/timeEngine';
import {
  careFeedback,
  computeCareView,
  isInsideRect,
  moodBonusAction,
  needBarValues,
} from '../careLogic';
import { PLACEHOLDER_NEED_VALUES } from '../../needBars';

const HOUR = 60 * 60 * 1000;
const T0 = Date.UTC(2026, 0, 1);

describe('computeCareView', () => {
  it('ohne Pflanze: keine Phase, keine Pflege', () => {
    const view = computeCareView(null, createNeeds(T0), T0, 1);
    expect(view).toEqual({ phase: null, snapshot: null, condition: null, canCare: false });
  });

  it('frisch gepflanzt: Keimung, Startwerte, Pflege erlaubt', () => {
    const view = computeCareView(createPlant('gustav', T0, false), createNeeds(T0), T0, 1);
    expect(view.phase).toBe('germination');
    expect(view.snapshot?.water).toBe(NEED_START.water);
    expect(view.condition).toBe('ok');
    expect(view.canCare).toBe(true);
  });

  it('nach einem Tag ohne Pflege: Koma, keine Pflege', () => {
    const view = computeCareView(createPlant('gustav', T0, false), createNeeds(T0), T0 + 25 * HOUR, 1);
    expect(view.condition).toBe('coma');
    expect(view.canCare).toBe(false);
  });

  it('rechnet aus Zeitstempeln: Balken sinken mit der Zeit', () => {
    const plant = createPlant('gustav', T0, false);
    const early = computeCareView(plant, createNeeds(T0), T0 + HOUR, 1);
    const late = computeCareView(plant, createNeeds(T0), T0 + 5 * HOUR, 1);
    expect(late.snapshot!.mood).toBeLessThan(early.snapshot!.mood);
  });
});

describe('needBarValues', () => {
  it('ohne Pflanze leer, Licht bleibt Platzhalter', () => {
    expect(needBarValues(null)).toEqual({ water: 0, nutrients: 0, light: PLACEHOLDER_NEED_VALUES.light, mood: 0 });
  });

  it('übernimmt Wasser, Nährstoffe und Laune aus dem Stand', () => {
    const view = computeCareView(createPlant('gustav', T0, false), createNeeds(T0), T0, 1);
    const values = needBarValues(view.snapshot);
    expect(values.water).toBe(NEED_START.water);
    expect(values.nutrients).toBe(NEED_START.nutrients);
    expect(values.mood).toBe(NEED_START.mood);
  });
});

describe('careFeedback', () => {
  it('Erfolg bei normaler Pflege', () => {
    const before = createNeeds(T0);
    const after = applyCare(before, { type: 'pet', phase: 'vegetative' }, T0 + HOUR);
    expect(careFeedback(before, after, true)).toBe('success');
  });

  it('Warnung bei Überwässerung', () => {
    const before = createNeeds(T0);
    const after = applyCare(before, { type: 'water', phase: 'seedling' }, T0);
    expect(careFeedback(before, after, true)).toBe('warning');
  });

  it('Warnung bei falschem Dünger', () => {
    const before = createNeeds(T0);
    const after = applyCare(before, { type: 'fertilizeBloom', phase: 'vegetative' }, T0);
    expect(careFeedback(before, after, true)).toBe('warning');
  });

  it('Fehler, wenn die Pflege nicht gewirkt hat', () => {
    const before = createNeeds(T0);
    expect(careFeedback(before, before, false)).toBe('error');
  });
});

describe('moodBonusAction', () => {
  it('Streicheln mit dem Minispiel-Bonus', () => {
    expect(moodBonusAction('vegetative')).toEqual({
      type: 'pet',
      phase: 'vegetative',
      amount: MINIGAME_REWARDS.moodPerRound,
    });
  });

  it('kein Bonus ohne Pflanze oder nach der Ernte', () => {
    expect(moodBonusAction(null)).toBeNull();
    expect(moodBonusAction('drying')).toBeNull();
    expect(moodBonusAction('done')).toBeNull();
  });
});

describe('isInsideRect', () => {
  const rect = { x: 100, y: 200, width: 50, height: 80 };

  it('Treffer innen und auf dem Rand', () => {
    expect(isInsideRect(120, 240, rect)).toBe(true);
    expect(isInsideRect(100, 200, rect)).toBe(true);
    expect(isInsideRect(150, 280, rect)).toBe(true);
  });

  it('kein Treffer außerhalb, aber mit Rand-Toleranz', () => {
    expect(isInsideRect(90, 240, rect)).toBe(false);
    expect(isInsideRect(90, 240, rect, 20)).toBe(true);
  });

  it('kein Ziel, kein Treffer', () => {
    expect(isInsideRect(0, 0, null)).toBe(false);
  });
});
