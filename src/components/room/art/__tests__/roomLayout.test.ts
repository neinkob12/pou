import { roomLayout } from '../roomLayout';

describe('roomLayout', () => {
  it('rechnet in Einheiten mit Breite 100', () => {
    const l = roomLayout(390, 844);
    expect(l.height).toBeCloseTo((844 / 390) * 100);
  });

  it('Boden liegt über dem Teppich, beide im Bild', () => {
    const l = roomLayout(390, 844);
    expect(l.floorY).toBeLessThan(l.rugY);
    expect(l.rugY).toBeLessThan(l.height);
  });

  it('Fenster endet über dem Boden, auch auf kleinen Bildschirmen', () => {
    for (const [w, h] of [
      [390, 844],
      [320, 568],
      [430, 932],
    ]) {
      const l = roomLayout(w, h);
      expect(l.window.y + l.window.h).toBeLessThan(l.floorY);
    }
  });

  it('ohne Breite keine Division durch null', () => {
    expect(roomLayout(0, 0).height).toBe(0);
  });
});
