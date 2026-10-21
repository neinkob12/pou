import { BACKDROPS, dropPath, leafPath, patternPoints, rayAngles, sparklePath } from '../backdrops';

describe('BACKDROPS', () => {
  it('hat für jeden Screen Verlauf und mindestens eine Musterform', () => {
    Object.values(BACKDROPS).forEach((b) => {
      expect(b.top).toMatch(/^#[0-9A-F]{6}$/i);
      expect(b.bottom).toMatch(/^#[0-9A-F]{6}$/i);
      expect(b.shapes.length).toBeGreaterThan(0);
    });
  });

  it('jeder Screen hat einen eigenen Grundton', () => {
    const tops = Object.values(BACKDROPS).map((b) => b.top);
    expect(new Set(tops).size).toBe(tops.length);
  });
});

describe('patternPoints', () => {
  it('füllt Breite und Höhe', () => {
    const pts = patternPoints(200, ['star', 'coin']);
    expect(pts.length).toBeGreaterThan(20);
    expect(Math.max(...pts.map((p) => p.y))).toBeGreaterThanOrEqual(190);
    expect(Math.min(...pts.map((p) => p.x))).toBeLessThan(10);
    expect(Math.max(...pts.map((p) => p.x))).toBeGreaterThan(90);
  });

  it('versetzt jede zweite Zeile und wechselt die Formen ab', () => {
    const pts = patternPoints(60, ['star', 'coin']);
    const row0 = pts.filter((p) => p.y === pts[0].y);
    const row1 = pts.filter((p) => p.y !== pts[0].y && p.y === pts[row0.length].y);
    expect(row1[0].x).not.toBe(row0[0].x);
    expect(row0[0].shape).not.toBe(row0[1].shape);
    pts.forEach((p) => expect(Math.abs(p.rotate)).toBeLessThanOrEqual(25));
  });

  it('liefert ohne Höhe oder Formen nichts', () => {
    expect(patternPoints(0, ['star'])).toEqual([]);
    expect(patternPoints(100, [])).toEqual([]);
    expect(patternPoints(Number.NaN, ['star'])).toEqual([]);
  });
});

describe('Pfade', () => {
  it('sind geschlossen und beginnen oben', () => {
    [sparklePath(4), leafPath(4), dropPath(4)].forEach((p) => {
      expect(p.startsWith('M0 -4')).toBe(true);
      expect(p.endsWith('Z')).toBe(true);
    });
  });
});

describe('rayAngles', () => {
  it('verteilt symmetrisch um die Senkrechte', () => {
    const a = rayAngles(5, 80);
    expect(a).toEqual([-40, -20, 0, 20, 40]);
    expect(rayAngles(1)).toEqual([0]);
    expect(rayAngles(0)).toEqual([]);
  });
});
