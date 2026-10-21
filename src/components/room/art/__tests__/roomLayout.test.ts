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

  it('Fenster hängt so tief, dass die Leisten oben es nicht verdecken', () => {
    const l = roomLayout(390, 844);
    // Die Balken, Phase und Tagesziel reichen bei 390 × 844 bis etwa 300 Punkte.
    expect(l.window.y).toBeGreaterThan((300 / 390) * 100);
    expect(l.shelf.y).toBeLessThan(l.floorY);
  });

  it('Lichterkette hängt über dem Fenster zum Regal', () => {
    const l = roomLayout(390, 844);
    expect(l.garland.x1).toBeGreaterThanOrEqual(l.window.x + l.window.w);
    expect(l.garland.x2).toBeLessThanOrEqual(l.shelf.x + 2);
    expect(l.garland.y).toBeLessThan(l.window.y);
  });

  it('ohne Breite keine Division durch null', () => {
    expect(roomLayout(0, 0).height).toBe(0);
  });
});

describe('roomLayout (ART-4)', () => {
  const sizes = [
    [390, 844],
    [320, 568],
    [430, 932],
  ];

  it('Kommode steht auf dem Boden, Poster hängt darüber ohne Überlappung', () => {
    for (const [w, h] of sizes) {
      const l = roomLayout(w, h);
      expect(l.dresser.y + l.dresser.h).toBeGreaterThanOrEqual(l.floorY);
      expect(l.dresser.y).toBeLessThan(l.floorY);
      // Bücher und Nachtlicht (bis 10 Einheiten) passen zwischen Poster und Kommode.
      expect(l.poster.y + l.poster.h).toBeLessThanOrEqual(l.dresser.y - 10);
    }
  });

  it('Holzverkleidung liegt unter dem Fensterbrett', () => {
    for (const [w, h] of sizes) {
      const l = roomLayout(w, h);
      expect(l.wainscotY).toBeGreaterThan(l.window.y + l.window.h);
      expect(l.wainscotY).toBeLessThan(l.floorY);
    }
  });
});
