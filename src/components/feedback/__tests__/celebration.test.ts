import {
  COUNT_UP_MS,
  coinsStartMs,
  countUpValue,
  easeOutCubic,
  makeSparkles,
  REVEAL_PAUSE_MS,
  STAR_STEP_MS,
  starDelays,
  tweenValue,
} from '../celebration';

describe('countUpValue', () => {
  it('beginnt bei 0 und endet genau auf dem Ziel', () => {
    expect(countUpValue(56, 0)).toBe(0);
    expect(countUpValue(56, COUNT_UP_MS)).toBe(56);
    expect(countUpValue(56, COUNT_UP_MS * 3)).toBe(56);
  });

  it('steigt nie und überschreitet das Ziel nicht', () => {
    let last = 0;
    for (let t = 0; t <= COUNT_UP_MS; t += 50) {
      const v = countUpValue(120, t);
      expect(v).toBeGreaterThanOrEqual(last);
      expect(v).toBeLessThanOrEqual(120);
      last = v;
    }
  });

  it('springt ohne Dauer sofort aufs Ziel', () => {
    expect(countUpValue(30, 0, 0)).toBe(30);
  });
});

describe('easeOutCubic', () => {
  it('begrenzt auf 0 bis 1', () => {
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(2)).toBe(1);
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });
});

describe('starDelays', () => {
  it('kommt Stern für Stern', () => {
    expect(starDelays(3)).toEqual([REVEAL_PAUSE_MS, REVEAL_PAUSE_MS + STAR_STEP_MS, REVEAL_PAUSE_MS + 2 * STAR_STEP_MS]);
    expect(starDelays(0)).toEqual([]);
  });

  it('zählt Münzen erst nach dem letzten Stern', () => {
    expect(coinsStartMs(5)).toBe(REVEAL_PAUSE_MS + 5 * STAR_STEP_MS);
    expect(coinsStartMs(0)).toBe(REVEAL_PAUSE_MS + STAR_STEP_MS);
  });
});

describe('makeSparkles', () => {
  it('verteilt Funken rundum und wechselt die Farben', () => {
    const sparkles = makeSparkles(8, 3, () => 0.5);
    expect(sparkles).toHaveLength(8);
    expect(sparkles.map((s) => s.angle)).toEqual([0, 45, 90, 135, 180, 225, 270, 315]);
    expect(sparkles.map((s) => s.colorIndex)).toEqual([0, 1, 2, 0, 1, 2, 0, 1]);
  });
});

describe('tweenValue', () => {
  it('läuft vom alten zum neuen Stand, auch abwärts', () => {
    expect(tweenValue(100, 40, 0, 600)).toBe(100);
    expect(tweenValue(100, 40, 600, 600)).toBe(40);
    const mid = tweenValue(100, 40, 300, 600);
    expect(mid).toBeLessThan(100);
    expect(mid).toBeGreaterThan(40);
  });
});
