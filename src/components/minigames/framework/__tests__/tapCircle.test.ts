import { TAP_CIRCLE } from '../../../../game/config';
import { NO_CIRCLE, isHit, needsRespawn, placeCircle, radiusForHits } from '../example/tapCircle';

describe('Tipp den Kreis', () => {
  it('Kreis schrumpft pro Treffer bis zum Minimum', () => {
    expect(radiusForHits(0)).toBe(TAP_CIRCLE.startRadius);
    expect(radiusForHits(1)).toBe(TAP_CIRCLE.startRadius - TAP_CIRCLE.shrinkPerHit);
    expect(radiusForHits(10_000)).toBe(TAP_CIRCLE.minRadius);
  });

  it('Kreis liegt immer komplett im Feld', () => {
    for (const [rx, ry] of [
      [0, 0],
      [0.999, 0.999],
      [0.5, 0.25],
    ]) {
      const c = placeCircle(rx, ry, 300, 500, 40, 0);
      expect(c.x).toBeGreaterThanOrEqual(40);
      expect(c.x).toBeLessThanOrEqual(260);
      expect(c.y).toBeGreaterThanOrEqual(40);
      expect(c.y).toBeLessThanOrEqual(460);
    }
    const tiny = placeCircle(0.5, 0.5, 20, 20, 40, 0);
    expect(tiny.x).toBe(40);
  });

  it('Treffer im Kreis plus Toleranz, kein Treffer ohne Kreis', () => {
    const c = placeCircle(0.5, 0.5, 200, 200, 30, 0);
    expect(isHit(c, c.x, c.y, 0)).toBe(true);
    expect(isHit(c, c.x + 30, c.y, 0)).toBe(true);
    expect(isHit(c, c.x + 35, c.y, 0)).toBe(false);
    expect(isHit(c, c.x + 35, c.y, 10)).toBe(true);
    expect(isHit(NO_CIRCLE, 0, 0, 10)).toBe(false);
  });

  it('neuer Kreis zu Beginn und nach Ablauf der Lebenszeit', () => {
    expect(needsRespawn(NO_CIRCLE, 0)).toBe(true);
    const c = placeCircle(0.5, 0.5, 200, 200, 30, 1000);
    expect(needsRespawn(c, 1000 + TAP_CIRCLE.lifetimeMs - 1)).toBe(false);
    expect(needsRespawn(c, 1000 + TAP_CIRCLE.lifetimeMs)).toBe(true);
  });
});
