import type { BudiPlantId } from '../../../../lib/assets';
import { colors } from '../../../../lib/theme';
import { mix } from '../color';
import { budCluster, fanLeaf, leafBase, leafletPath, place, plantSpec, PLANT_H, PLANT_W, SOIL } from '../geometry';
import { plantPalette } from '../palette';

const GROWING: BudiPlantId[] = [
  'b01_germination',
  'b02_seedling',
  'b03_vegetative_small',
  'b04_vegetative_large',
  'b05_flowering_early',
  'b06_flowering_full',
];

describe('mix', () => {
  it('mischt zwei Farben linear', () => {
    expect(mix('#000000', '#FFFFFF', 0)).toBe('#000000');
    expect(mix('#000000', '#FFFFFF', 1)).toBe('#FFFFFF');
    expect(mix('#000000', '#FFFFFF', 0.5)).toBe('#808080');
  });

  it('begrenzt den Anteil auf 0 bis 1', () => {
    expect(mix('#102030', '#FFFFFF', -2)).toBe('#102030');
    expect(mix('#102030', '#FFFFFF', 5)).toBe('#FFFFFF');
  });
});

describe('place', () => {
  it('dreht im Uhrzeigersinn um den Ursprung', () => {
    const p = place(0, -10, 90, { x: 50, y: 50 });
    expect(p.x).toBeCloseTo(60);
    expect(p.y).toBeCloseTo(50);
  });
});

describe('Blattformen', () => {
  it('ein Fiederblatt ist ein geschlossener Pfad', () => {
    const d = leafletPath({ x: 10, y: 10 }, 0, 8, 3);
    expect(d.startsWith('M10 10')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
  });

  it('ein Fächerblatt hat so viele Fiederblätter wie bestellt', () => {
    for (const count of [1, 3, 5, 7] as const) {
      expect(fanLeaf({ x: 50, y: 30 }, 0, 10, count)).toHaveLength(count);
    }
  });

  it('der Blattstiel verlängert den Ansatz in Blattrichtung', () => {
    const base = leafBase({ at: { x: 50, y: 40 }, deg: 90, size: 10, count: 5, petiole: 4 });
    expect(base.x).toBeCloseTo(54);
    expect(base.y).toBeCloseTo(40);
  });
});

describe('plantSpec', () => {
  it('wächst von Phase zu Phase', () => {
    const tops = GROWING.map((id) => plantSpec(id).top);
    for (let i = 1; i < tops.length; i++) expect(tops[i]).toBeLessThanOrEqual(tops[i - 1]);
  });

  it('bleibt auf der Pflanzen-Leinwand', () => {
    for (const id of GROWING) {
      const spec = plantSpec(id);
      expect(spec.top).toBeGreaterThanOrEqual(0);
      for (const leaf of spec.leaves) {
        expect(leaf.at.x).toBeGreaterThan(0);
        expect(leaf.at.x).toBeLessThan(PLANT_W);
        expect(leaf.at.y).toBeLessThan(PLANT_H);
      }
    }
  });

  it('Knospen erst in der Blüte, Samenschale nur beim Keimen', () => {
    expect(plantSpec('b04_vegetative_large').buds).toHaveLength(0);
    expect(plantSpec('b05_flowering_early').buds.length).toBeGreaterThan(0);
    expect(plantSpec('b06_flowering_full').buds.length).toBeGreaterThan(plantSpec('b05_flowering_early').buds.length);
    expect(plantSpec('b01_germination').seed).toBe(true);
    expect(plantSpec('b02_seedling').seed).toBe(false);
  });

  it('jeder Stängel startet in der Erde', () => {
    for (const id of GROWING) expect(plantSpec(id).stem.startsWith(`M${SOIL.x} ${SOIL.y}`)).toBe(true);
  });

  it('Ernte-Ebenen haben keinen Pflanzen-Bauplan', () => {
    expect(plantSpec('b07_drying').leaves).toHaveLength(0);
    expect(plantSpec('b08_harvest_ready').stem).toBe('');
  });
});

describe('budCluster', () => {
  it('liefert eine feste Traube um den Ansatz', () => {
    const balls = budCluster({ at: { x: 50, y: 20 }, r: 4 });
    expect(balls).toHaveLength(4);
    expect(budCluster({ at: { x: 50, y: 20 }, r: 4 })).toEqual(balls);
  });
});

describe('plantPalette', () => {
  it('ohne Sorte die Grundfarben', () => {
    const p = plantPalette(null, false);
    expect(p.leaf).toBe(colors.plantLight);
    expect(p.pistil).toBe('#FFFFFF');
  });

  it('färbt Knospen nach Sorte und Härchen bei Reife', () => {
    const plain = plantPalette(null, true);
    const lotte = plantPalette('lavender', true);
    expect(lotte.bud).not.toBe(plain.bud);
    expect(plain.pistil).not.toBe(plantPalette(null, false).pistil);
  });
});

describe('fanLeaf Blattbreite je Sorte', () => {
  const xs = (d: string) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number).filter((_, i) => i % 2 === 0);
  const spread = (factor: number) => {
    const [leaflet] = fanLeaf({ x: 50, y: 50 }, 0, 20, 1, factor);
    const x = xs(leaflet.shape);
    return Math.max(...x) - Math.min(...x);
  };

  it('macht Fiederblätter schmaler oder breiter', () => {
    expect(spread(0.6)).toBeLessThan(spread(1));
    expect(spread(1.4)).toBeGreaterThan(spread(1));
  });
});
