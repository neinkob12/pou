import { NEED_DECAY_PER_REAL_HOUR, UPGRADE_IDS, UPGRADES } from '../config';
import { dryingHumidity, moldChancePerCheck, pestChancePerCheck } from '../health';
import { computeNeeds, createNeeds } from '../needs';
import {
  buyLevel,
  canBuy,
  createUpgradeLevels,
  levelOf,
  maxLevel,
  nextLevel,
  upgradeEffects,
  type UpgradeLevels,
} from '../shop';

const T0 = Date.UTC(2026, 9, 1, 12, 0, 0);
const HOUR = 60 * 60 * 1000;

const owned = (partial: Partial<UpgradeLevels>): UpgradeLevels => ({ ...createUpgradeLevels(), ...partial });

describe('Upgrade-Stufen', () => {
  it('startet ohne Upgrades und ohne Wirkung', () => {
    const levels = createUpgradeLevels();
    expect(UPGRADE_IDS.every((id) => levels[id] === 0)).toBe(true);
    expect(upgradeEffects(levels)).toEqual({
      needModifiers: {},
      lightDecayMultiplier: 1,
      yieldMultiplier: 1,
      pestChanceMultiplier: 1,
      hasDehumidifier: false,
    });
  });

  it('kauft Stufe für Stufe bis zum Maximum', () => {
    let levels = createUpgradeLevels();
    for (let i = 1; i <= maxLevel('pot'); i++) {
      expect(nextLevel(levels, 'pot')).toBe(UPGRADES.pot[i - 1]);
      levels = buyLevel(levels, 'pot');
      expect(levels.pot).toBe(i);
    }
    expect(nextLevel(levels, 'pot')).toBeNull();
    expect(buyLevel(levels, 'pot')).toBe(levels);
  });

  it('kaufbar nur mit genug Münzen und solange eine Stufe fehlt', () => {
    const price = UPGRADES.led[0].price;
    expect(canBuy(createUpgradeLevels(), 'led', price)).toBe(true);
    expect(canBuy(createUpgradeLevels(), 'led', price - 1)).toBe(false);
    expect(canBuy(owned({ led: 1 }), 'led', 10_000)).toBe(false);
  });

  it('behandelt fehlende oder kaputte Stufen aus alten Spielständen als 0 bzw. Maximum', () => {
    expect(levelOf({}, 'pot')).toBe(0);
    expect(levelOf({ pot: Number.NaN }, 'pot')).toBe(0);
    expect(levelOf({ pot: -2 }, 'pot')).toBe(0);
    expect(levelOf({ pot: 99 }, 'pot')).toBe(maxLevel('pot'));
  });

  it('jede Stufe kostet mehr als die davor', () => {
    for (const id of UPGRADE_IDS) {
      const prices = UPGRADES[id].map((l) => l.price);
      expect(prices.every((p, i) => p > 0 && (i === 0 || p > prices[i - 1]))).toBe(true);
    }
  });
});

describe('Upgrade-Wirkung', () => {
  const hours = 10;
  const waterAfter = (levels: UpgradeLevels) =>
    computeNeeds(createNeeds(T0), T0 + hours * HOUR, upgradeEffects(levels).needModifiers, 'vegetative').water;

  it('größerer Topf: Wasser sinkt langsamer, je Stufe mehr, und mehr Ertrag', () => {
    const none = waterAfter(createUpgradeLevels());
    const lvl1 = waterAfter(owned({ pot: 1 }));
    const lvl3 = waterAfter(owned({ pot: 3 }));
    expect(lvl1).toBeGreaterThan(none);
    expect(lvl3).toBeGreaterThan(lvl1);
    const water = UPGRADES.pot[2].effect.needDecay?.water ?? 1;
    expect(lvl3).toBeCloseTo(80 - NEED_DECAY_PER_REAL_HOUR.water * water * hours);
    expect(upgradeEffects(owned({ pot: 2 })).yieldMultiplier).toBe(UPGRADES.pot[1].effect.yieldMultiplier);
  });

  it('Bio-Erde: Nährstoffe sinken langsamer, Wasser bleibt gleich', () => {
    const mods = upgradeEffects(owned({ bioSoil: 1 })).needModifiers;
    const plain = computeNeeds(createNeeds(T0), T0 + hours * HOUR, {}, 'vegetative');
    const soil = computeNeeds(createNeeds(T0), T0 + hours * HOUR, mods, 'vegetative');
    expect(soil.nutrients).toBeGreaterThan(plain.nutrients);
    expect(soil.water).toBe(plain.water);
  });

  it('LED: Lichtbalken sinkt langsamer', () => {
    expect(upgradeEffects(owned({ led: 1 })).lightDecayMultiplier).toBeLessThan(1);
  });

  it('Nützlings-Kit: weniger Schädlinge', () => {
    const { pestChanceMultiplier } = upgradeEffects(owned({ beneficials: 1 }));
    expect(pestChancePerCheck(0.5, pestChanceMultiplier)).toBeLessThan(pestChancePerCheck(0.5));
  });

  it('Ventilator und Entfeuchter: kein Schimmel beim Trocknen', () => {
    const { hasDehumidifier } = upgradeEffects(owned({ fanDehumidifier: 1 }));
    expect(hasDehumidifier).toBe(true);
    expect(moldChancePerCheck(dryingHumidity(hasDehumidifier))).toBe(0);
    expect(moldChancePerCheck(dryingHumidity(false))).toBeGreaterThan(0);
  });

  it('alle Upgrades zusammen wirken gleichzeitig', () => {
    const all = owned({ pot: 3, led: 1, fanDehumidifier: 1, bioSoil: 1, beneficials: 1 });
    const fx = upgradeEffects(all);
    expect(fx.needModifiers.water).toBe(UPGRADES.pot[2].effect.needDecay?.water);
    expect(fx.needModifiers.nutrients).toBe(UPGRADES.bioSoil[0].effect.needDecay?.nutrients);
    expect(fx.needModifiers.mood).toBeUndefined();
    expect(fx.pestChanceMultiplier).toBeLessThan(1);
    expect(fx.hasDehumidifier).toBe(true);
  });
});
