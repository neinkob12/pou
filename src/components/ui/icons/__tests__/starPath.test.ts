import { starPath } from '../starPath';

const points = (d: string) =>
  d
    .replace(/[MZ]/g, '')
    .split('L')
    .map((p) => p.trim().split(' ').map(Number));

describe('starPath', () => {
  it('hat zehn Ecken, abwechselnd außen und innen', () => {
    const pts = points(starPath(50, 50, 10, 0.5));
    expect(pts).toHaveLength(10);
    pts.forEach(([x, y], i) => {
      expect(Math.hypot(x - 50, y - 50)).toBeCloseTo(i % 2 ? 5 : 10, 1);
    });
  });

  it('beginnt mit der Spitze oben', () => {
    const [[x, y]] = points(starPath(20, 30, 8));
    expect(x).toBeCloseTo(20, 2);
    expect(y).toBeCloseTo(22, 2);
  });

  it('ist ein geschlossener Pfad', () => {
    expect(starPath(0, 0, 1)).toMatch(/^M.*Z$/);
  });
});
