import { MINIGAME_FUN, TAP_CIRCLE } from '../../../../game/config';
import { placeCircle } from '../example/tapCircle';
import { circleLifetime, inFinale, pointsForCircle, rollGolden } from '../example/tapGolden';

const fun = MINIGAME_FUN.tap;
const endMs = TAP_CIRCLE.durationSeconds * 1000;

describe('Tipp den Kreis: goldene Knospen (Auftrag 45)', () => {
  it('am Anfang nie golden, danach mit der Grundchance', () => {
    expect(rollGolden(0, fun.goldenFromMs - 1)).toBe(false);
    expect(rollGolden(fun.goldenChance - 0.001, fun.goldenFromMs)).toBe(true);
    expect(rollGolden(fun.goldenChance + 0.001, fun.goldenFromMs)).toBe(false);
  });

  it('im Endspurt öfter golden', () => {
    const finaleStart = endMs - fun.finaleSeconds * 1000;
    expect(inFinale(finaleStart - 1)).toBe(false);
    expect(inFinale(finaleStart)).toBe(true);
    expect(rollGolden(fun.finaleGoldenChance - 0.001, finaleStart)).toBe(true);
    expect(fun.finaleGoldenChance).toBeGreaterThan(fun.goldenChance);
  });

  it('golden bringt mehr Punkte und steht kürzer', () => {
    const normal = placeCircle(0.5, 0.5, 300, 300, 30, 10_000);
    const golden = { ...normal, golden: true };
    expect(pointsForCircle(normal)).toBe(TAP_CIRCLE.pointsPerHit);
    expect(pointsForCircle(golden)).toBe(fun.goldenPoints);
    expect(circleLifetime(golden)).toBeCloseTo(circleLifetime(normal) * fun.goldenLifetimeFactor);
  });
});
