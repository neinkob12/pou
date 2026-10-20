import { BASE_PHASES, STRAINS } from '../config';
import {
  careFactor,
  computeQualityStars,
  computeYield,
  growthFactor,
  harvestRewards,
  moodFactor,
} from '../harvest';
import { createPlant, PlantRecord } from '../timeEngine';

const T0 = Date.UTC(2026, 9, 1, 12, 0, 0);
const SEEDLING_END = BASE_PHASES.germinationDays + BASE_PHASES.seedlingDays;

/** Pflanze, die nach `vegDays` Tagen Wachstum auf 12/12 umgeschaltet wurde. */
function flippedPlant(strainId: PlantRecord['strainId'], vegDays: number): PlantRecord {
  return { ...createPlant(strainId, T0, false), lightFlipAtPlantDay: SEEDLING_END + vegDays };
}

describe('harvest', () => {
  describe('Beispielrechnung KONZEPT.md: Ernte-Wert = Ertrag × Qualität', () => {
    // Gurken-Gustav, 35 Tage Wachstum (14 über dem Minimum), perfekte Pflege, gute Laune,
    // Trichom-Lupe perfekt, Trocknung halb gut, gesund.
    const plant = flippedPlant('gustav', 35);
    const strain = STRAINS.gustav;

    it('Ertrag: 10 × 1,28 (Wachstum) × 1 (Pflege) × 1,05 (Laune) × 1 (Sorte) = 13,44, also 13', () => {
      expect(computeYield(plant, 1, 80, strain)).toBe(13);
    });

    it('Qualität: 1 + 2 (Lupe) + 1 (Trocknung) − 0 = 4 Sterne', () => {
      expect(computeQualityStars(0, 0.5, 1)).toBe(4);
    });

    it('Kräutermarkt: 13 × 5 Münzen × 1,25 (4 Sterne) = 81 Münzen und 2 Samen-Fragmente', () => {
      expect(harvestRewards(13, 4, strain)).toEqual({ coins: 81, seedFragments: 2 });
    });
  });

  describe('computeYield', () => {
    it('gibt beim Minimum-Wachstum und perfekter Pflege den Grundertrag', () => {
      expect(computeYield(flippedPlant('gustav', 21), 1, 50, STRAINS.gustav)).toBe(10);
    });

    it('deckelt den Wachstumsbonus beim Maximum', () => {
      const atMax = computeYield(flippedPlant('gustav', BASE_PHASES.vegetativeMaxDays), 1, 50, STRAINS.gustav);
      const beyond = computeYield(flippedPlant('gustav', 80), 1, 50, STRAINS.gustav);
      expect(atMax).toBe(16); // 10 × 1,56
      expect(beyond).toBe(atMax);
    });

    it('halbiert den Ertrag bei Pflege 0', () => {
      expect(computeYield(flippedPlant('gustav', 21), 0, 50, STRAINS.gustav)).toBe(5);
    });

    it('nutzt den Sorten-Multiplikator', () => {
      expect(computeYield(flippedPlant('sascha', 21), 1, 50, STRAINS.sascha)).toBe(16);
    });

    it('rechnet Autoflower mit fester Wachstumsdauer ohne Bonus', () => {
      const plant = createPlant('anton', T0, false);
      expect(computeYield(plant, 1, 50, STRAINS.anton)).toBe(6);
    });

    it('nimmt das Minimum an, solange nicht umgeschaltet wurde', () => {
      expect(computeYield(createPlant('gustav', T0, false), 1, 50, STRAINS.gustav)).toBe(10);
    });

    it('gibt mindestens eine Einheit', () => {
      expect(computeYield(createPlant('anton', T0, false), 0, 0, STRAINS.anton)).toBe(3);
      const tiny = { ...STRAINS.anton, yieldMultiplier: 0.01 };
      expect(computeYield(createPlant('anton', T0, false), 0, 0, tiny)).toBe(1);
    });
  });

  describe('Faktoren', () => {
    it('growthFactor steigt um 2 % je Tag über dem Minimum', () => {
      expect(growthFactor(null)).toBe(1);
      expect(growthFactor(14)).toBe(1);
      expect(growthFactor(31)).toBeCloseTo(1.2);
    });

    it('careFactor klemmt auf 0 bis 1', () => {
      expect(careFactor(-1)).toBe(0.5);
      expect(careFactor(0.5)).toBe(0.75);
      expect(careFactor(2)).toBe(1);
    });

    it('moodFactor gibt den Bonus nur über der Schwelle', () => {
      expect(moodFactor(70)).toBe(1);
      expect(moodFactor(71)).toBeCloseTo(1.05);
    });
  });

  describe('computeQualityStars', () => {
    it('gibt 5 Sterne bei perfekter Lupe und Trocknung', () => {
      expect(computeQualityStars(0, 1, 1)).toBe(5);
    });

    it('gibt 1 Stern, wenn alles schiefgeht', () => {
      expect(computeQualityStars(0, 0, 0)).toBe(1);
    });

    it('zieht den Krankheitsmalus ab', () => {
      expect(computeQualityStars(1, 1, 1)).toBe(4);
      expect(computeQualityStars(2.5, 1, 1)).toBe(3); // 2,5 gerundet auf 3
    });

    it('fällt nie unter 1 Stern', () => {
      expect(computeQualityStars(10, 1, 1)).toBe(1);
    });

    it('klemmt Eingaben außerhalb 0 bis 1 und ignoriert negativen Malus', () => {
      expect(computeQualityStars(-3, 5, 5)).toBe(5);
      expect(computeQualityStars(0, -1, Number.NaN)).toBe(1);
    });
  });

  describe('harvestRewards', () => {
    it('Münzen steigen mit Sternen', () => {
      const coins = ([1, 2, 3, 4, 5] as const).map((s) => harvestRewards(10, s, STRAINS.gustav).coins);
      expect(coins).toEqual([25, 38, 50, 63, 75]);
    });

    it('nutzt den Wert-Multiplikator der Sorte', () => {
      expect(harvestRewards(10, 3, STRAINS.lotte).coins).toBe(70);
      expect(harvestRewards(10, 3, STRAINS.koelsch).coins).toBe(100);
    });

    it('gibt Samen-Fragmente nach Sternen', () => {
      const frags = ([1, 2, 3, 4, 5] as const).map((s) => harvestRewards(10, s, STRAINS.gustav).seedFragments);
      expect(frags).toEqual([0, 1, 1, 2, 3]);
    });

    it('gibt bei 0 Ertrag keine Münzen', () => {
      expect(harvestRewards(0, 5, STRAINS.gustav).coins).toBe(0);
    });
  });
});
