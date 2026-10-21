import {
  COIN_RAIN_MAX,
  COIN_RAIN_MIN,
  coinRainCount,
  enterPose,
  levelReached,
  makeCoinRain,
  makeConfetti,
  SCREEN_ENTER,
  shakeSteps,
} from '../rewardFx';

/** Fester Zufall, damit die Tests stabil sind. */
function seeded(seed = 1) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

describe('makeConfetti', () => {
  it('verteilt die Stücke über die ganze Breite', () => {
    const pieces = makeConfetti(40, 4, seeded());
    expect(pieces).toHaveLength(40);
    pieces.forEach((p) => {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(1);
      expect(p.colorIndex).toBeLessThan(4);
      expect(p.durationMs).toBeGreaterThan(0);
    });
    expect(Math.min(...pieces.map((p) => p.x))).toBeLessThan(0.1);
    expect(Math.max(...pieces.map((p) => p.x))).toBeGreaterThan(0.9);
  });

  it('liefert für 0 oder negative Anzahl nichts', () => {
    expect(makeConfetti(0, 4)).toEqual([]);
    expect(makeConfetti(-3, 4)).toEqual([]);
  });

  it('runde Stücke sind so hoch wie breit', () => {
    makeConfetti(30, 3, seeded(7))
      .filter((p) => p.round)
      .forEach((p) => expect(p.height).toBe(p.width));
  });
});

describe('coinRainCount', () => {
  it('ohne Münzen kein Regen', () => {
    expect(coinRainCount(0)).toBe(0);
    expect(coinRainCount(-5)).toBe(0);
    expect(coinRainCount(Number.NaN)).toBe(0);
  });

  it('wächst mit der Belohnung und bleibt in den Grenzen', () => {
    expect(coinRainCount(1)).toBe(COIN_RAIN_MIN);
    expect(coinRainCount(60)).toBeGreaterThan(coinRainCount(10));
    expect(coinRainCount(100000)).toBe(COIN_RAIN_MAX);
  });
});

describe('makeCoinRain', () => {
  it('landet im unteren Bereich, gestaffelt', () => {
    const coins = makeCoinRain(12, seeded(3));
    expect(coins).toHaveLength(12);
    coins.forEach((c) => {
      expect(c.landY).toBeGreaterThanOrEqual(0.7);
      expect(c.landY).toBeLessThanOrEqual(0.9);
      expect(c.x).toBeGreaterThan(0);
      expect(c.x).toBeLessThan(1);
    });
    expect(coins[11].delayMs).toBeGreaterThan(coins[0].delayMs);
  });
});

describe('shakeSteps', () => {
  it('klingt ab und endet in Ruhe', () => {
    const steps = shakeSteps(1);
    expect(steps[steps.length - 1]).toEqual({ x: 0, y: 0, rotate: 0 });
    for (let i = 1; i < steps.length; i++) {
      expect(Math.abs(steps[i].x)).toBeLessThanOrEqual(Math.abs(steps[i - 1].x));
    }
  });

  it('wechselt die Richtung und skaliert mit der Stärke', () => {
    const strong = shakeSteps(1);
    const weak = shakeSteps(0.3);
    expect(Math.sign(strong[0].x)).toBe(-Math.sign(strong[1].x));
    expect(Math.abs(weak[0].x)).toBeLessThan(Math.abs(strong[0].x));
    expect(shakeSteps(5)[0].x).toBe(strong[0].x);
    expect(shakeSteps(0).every((s) => s.x === 0 && s.rotate === 0)).toBe(true);
  });
});

describe('enterPose', () => {
  it('startet klein und tiefer, endet in voller Größe am Platz', () => {
    expect(enterPose(0)).toEqual({ scale: SCREEN_ENTER.fromScale, translateY: SCREEN_ENTER.fromY, opacity: 0 });
    expect(enterPose(1)).toEqual({ scale: 1, translateY: 0, opacity: 1 });
  });

  it('schießt bei Überschwingen leicht über, Deckkraft bleibt bei 1', () => {
    const over = enterPose(1.05);
    expect(over.scale).toBeGreaterThan(1);
    expect(over.translateY).toBeLessThan(0);
    expect(over.opacity).toBe(1);
  });
});

describe('levelReached', () => {
  it('meldet nur einen Aufstieg', () => {
    expect(levelReached(2, 3)).toBe(3);
    expect(levelReached(3, 3)).toBeNull();
    expect(levelReached(4, 2)).toBeNull();
  });
});
