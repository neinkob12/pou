import { TAP_CIRCLE } from '../../../../game/config';
import { lifetimeAt } from '../example/tapCircle';

describe('Tipp den Kreis: Tempo über die Runde', () => {
  it('Knospen bleiben am Anfang lange und am Ende kurz stehen', () => {
    const end = TAP_CIRCLE.durationSeconds * 1000;
    expect(lifetimeAt(0)).toBe(TAP_CIRCLE.lifetimeMs);
    expect(lifetimeAt(end)).toBe(TAP_CIRCLE.lifetimeEndMs);
    expect(lifetimeAt(end / 2)).toBeCloseTo((TAP_CIRCLE.lifetimeMs + TAP_CIRCLE.lifetimeEndMs) / 2);
    expect(lifetimeAt(end * 3)).toBe(TAP_CIRCLE.lifetimeEndMs);
  });
});
