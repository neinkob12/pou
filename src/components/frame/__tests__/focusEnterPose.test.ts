import { focusEnterPose } from '../focusEnterPose';

describe('focusEnterPose', () => {
  it('startet unsichtbar und versetzt, endet an Ort und Stelle', () => {
    expect(focusEnterPose('top', 0, 18)).toEqual({ opacity: 0, translateY: -18, scale: 1 });
    expect(focusEnterPose('bottom', 0, 18)).toEqual({ opacity: 0, translateY: 18, scale: 1 });
    for (const from of ['top', 'bottom', 'center'] as const) {
      const end = focusEnterPose(from, 1, 18);
      expect(end.opacity).toBe(1);
      expect(end.translateY).toBeCloseTo(0);
      expect(end.scale).toBe(1);
    }
  });

  it('Figur aus der Mitte wächst statt zu gleiten', () => {
    const p = focusEnterPose('center', 0.5, 18);
    expect(p.translateY).toBe(0);
    expect(p.scale).toBeGreaterThan(0.88);
    expect(p.scale).toBeLessThan(1);
  });

  it('ist früh voll sichtbar und bleibt beim Überschwingen bei 1', () => {
    expect(focusEnterPose('top', 0.34, 18).opacity).toBe(1);
    expect(focusEnterPose('top', 1.08, 18).opacity).toBe(1);
    // Überschwingen schiebt leicht über das Ziel hinaus, in Gegenrichtung.
    expect(focusEnterPose('top', 1.08, 18).translateY).toBeGreaterThan(0);
  });
});
