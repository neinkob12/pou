import {
  LEVEL_XP_THRESHOLDS,
  SEED_FRAGMENTS_BY_STARS,
  STRAINS,
  XP_PER_HARVEST,
  XP_PER_STAR,
  type StrainId,
} from '../config';
import {
  applyHarvest,
  canPlantNewSeed,
  EMPTY_PROGRESS,
  isStrainUnlocked,
  levelForXp,
  levelProgress,
  newlyUnlocked,
  STRAIN_ORDER,
  unlockByEvent,
  unlockedStrainIds,
  unlockProgress,
  xpForHarvest,
  type ProgressStats,
} from '../progression';
import { createPlant, harvest } from '../timeEngine';

const T0 = Date.UTC(2026, 9, 1, 12, 0, 0);
const DAY = 24 * 60 * 60 * 1000;

const stats = (patch: Partial<ProgressStats>): ProgressStats => ({ ...EMPTY_PROGRESS, ...patch });

/** Kleinster Zählerstand, der die Bedingung aus config.ts erfüllt. */
function statsMeeting(id: StrainId): ProgressStats {
  const u = STRAINS[id].unlock;
  switch (u.type) {
    case 'harvests':
      return stats({ harvests: u.count });
    case 'seedFragments':
      return stats({ seedFragments: u.count });
    case 'level':
      return stats({ xp: LEVEL_XP_THRESHOLDS[u.level - 1] });
    case 'event':
      return stats({ eventUnlocks: [id] });
    default:
      return EMPTY_PROGRESS;
  }
}

/** Ein Schritt unter der Bedingung. */
function statsJustBelow(id: StrainId): ProgressStats {
  const u = STRAINS[id].unlock;
  switch (u.type) {
    case 'harvests':
      return stats({ harvests: u.count - 1 });
    case 'seedFragments':
      return stats({ seedFragments: u.count - 1 });
    case 'level':
      return stats({ xp: LEVEL_XP_THRESHOLDS[u.level - 1] - 1 });
    default:
      return EMPTY_PROGRESS;
  }
}

describe('Level', () => {
  it('startet auf Level 1', () => {
    expect(levelForXp(0)).toBe(1);
  });

  it('steigt genau an den Schwellen aus config.ts', () => {
    LEVEL_XP_THRESHOLDS.forEach((threshold, i) => {
      expect(levelForXp(threshold)).toBe(i + 1);
      if (threshold > 0) expect(levelForXp(threshold - 1)).toBe(i);
    });
  });

  it('bleibt über der letzten Schwelle auf dem höchsten Level', () => {
    const top = LEVEL_XP_THRESHOLDS[LEVEL_XP_THRESHOLDS.length - 1];
    expect(levelForXp(top * 10)).toBe(LEVEL_XP_THRESHOLDS.length);
    expect(levelProgress(top * 10)).toMatchObject({ xpForNextLevel: null, progress: 1 });
  });

  it('zeigt den Fortschritt im aktuellen Level', () => {
    const [, l2, l3] = LEVEL_XP_THRESHOLDS;
    const p = levelProgress(l2 + (l3 - l2) / 2);
    expect(p.level).toBe(2);
    expect(p.xpForNextLevel).toBe(l3 - l2);
    expect(p.progress).toBeCloseTo(0.5);
  });

  it('gibt Erfahrung aus Ernte und Sternen, Sterne begrenzt auf 1 bis 5', () => {
    expect(xpForHarvest(3)).toBe(XP_PER_HARVEST + 3 * XP_PER_STAR);
    expect(xpForHarvest(9)).toBe(XP_PER_HARVEST + 5 * XP_PER_STAR);
    expect(xpForHarvest(0)).toBe(XP_PER_HARVEST + 1 * XP_PER_STAR);
  });
});

describe('applyHarvest', () => {
  it('zählt Ernte, Erfahrung und Samen-Fragmente', () => {
    const after = applyHarvest(EMPTY_PROGRESS, 5);
    expect(after).toEqual({
      ...EMPTY_PROGRESS,
      harvests: 1,
      xp: xpForHarvest(5),
      seedFragments: SEED_FRAGMENTS_BY_STARS[5],
    });
  });

  it('ändert den alten Stand nicht', () => {
    const before = stats({ harvests: 2 });
    applyHarvest(before, 3);
    expect(before.harvests).toBe(2);
  });
});

describe('Freischaltung nach STRAINS.unlock', () => {
  it('am Anfang sind nur Start-Sorten frei', () => {
    const start = STRAIN_ORDER.filter((id) => STRAINS[id].unlock.type === 'start');
    expect(start.length).toBeGreaterThan(0);
    expect(unlockedStrainIds(EMPTY_PROGRESS)).toEqual(start);
  });

  it.each(STRAIN_ORDER)('%s wird genau bei seiner Bedingung frei', (id) => {
    const strain = STRAINS[id];
    expect(isStrainUnlocked(strain, statsMeeting(id))).toBe(true);
    if (strain.unlock.type !== 'start') {
      expect(isStrainUnlocked(strain, statsJustBelow(id))).toBe(false);
    }
  });

  it('Lila Lotte nach 3 Ernten, Sativa Sascha nach 10 Fragmenten, Auto-Anton ab Level 5', () => {
    expect(isStrainUnlocked(STRAINS.lotte, stats({ harvests: 3 }))).toBe(true);
    expect(isStrainUnlocked(STRAINS.sascha, stats({ seedFragments: 10 }))).toBe(true);
    expect(isStrainUnlocked(STRAINS.anton, stats({ xp: LEVEL_XP_THRESHOLDS[4] }))).toBe(true);
  });

  it('Ereignis-Sorten nur per Ereignis, nie durch Zähler', () => {
    const maxed = stats({ harvests: 999, seedFragments: 999, xp: 999999 });
    expect(isStrainUnlocked(STRAINS.koelsch, maxed)).toBe(false);
    expect(isStrainUnlocked(STRAINS.koelsch, unlockByEvent(maxed, 'koelsch'))).toBe(true);
  });

  it('Ereignis doppelt freischalten ändert nichts', () => {
    const once = unlockByEvent(EMPTY_PROGRESS, 'koelsch');
    expect(unlockByEvent(once, 'koelsch')).toBe(once);
  });

  it('zeigt den Fortschritt zur Freischaltung, gedeckelt beim Ziel', () => {
    expect(unlockProgress(STRAINS.lotte, stats({ harvests: 1 }))).toEqual({ current: 1, target: 3 });
    expect(unlockProgress(STRAINS.sascha, stats({ seedFragments: 40 }))).toEqual({ current: 10, target: 10 });
    expect(unlockProgress(STRAINS.gustav, EMPTY_PROGRESS)).toBeNull();
    expect(unlockProgress(STRAINS.koelsch, EMPTY_PROGRESS)).toBeNull();
  });

  it('meldet neu freigeschaltete Sorten nach einer Ernte', () => {
    const before = stats({ harvests: 2 });
    expect(newlyUnlocked(before, applyHarvest(before, 3))).toEqual(['lotte']);
    expect(newlyUnlocked(before, before)).toEqual([]);
  });
});

describe('canPlantNewSeed', () => {
  it('erlaubt einen Samen im leeren Topf', () => {
    expect(canPlantNewSeed(null, T0)).toBe(true);
  });

  it('verbietet einen Samen, solange Budi wächst oder trocknet', () => {
    const plant = createPlant('anton', T0, false);
    expect(canPlantNewSeed(plant, T0 + DAY)).toBe(false);
  });

  it('erlaubt einen Samen, wenn die Ernte fertig getrocknet ist', () => {
    // Auto-Anton: Keimung, Sämling, festes Wachstum, Blüte. Reichlich Zeit bis "ready".
    const plant = createPlant('anton', T0, false);
    const harvested = harvest(plant, T0 + 30 * DAY);
    expect(canPlantNewSeed(harvested, T0 + 30 * DAY)).toBe(false);
    expect(canPlantNewSeed(harvested, T0 + 40 * DAY)).toBe(true);
  });
});
