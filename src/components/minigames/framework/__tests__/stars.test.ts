import { MINIGAME_FEEL } from '../../../../game/config';
import { pointsToNextStar, starsFor } from '../stars';

const table = { demo: [10, 20, 30] as const };

describe('Sterne', () => {
  it('vergibt 0 bis 3 Sterne nach den Grenzen', () => {
    expect(starsFor('demo', 0, table)).toBe(0);
    expect(starsFor('demo', 10, table)).toBe(1);
    expect(starsFor('demo', 29, table)).toBe(2);
    expect(starsFor('demo', 30, table)).toBe(3);
    expect(starsFor('unbekannt', 99, table)).toBe(0);
    expect(starsFor('demo', NaN, table)).toBe(0);
  });

  it('nennt die Punkte bis zum nächsten Stern', () => {
    expect(pointsToNextStar('demo', 4, table)).toBe(6);
    expect(pointsToNextStar('demo', 25, table)).toBe(5);
    expect(pointsToNextStar('demo', 30, table)).toBeNull();
  });

  it('hat aufsteigende Grenzen für alle fünf Spiele', () => {
    for (const id of ['tap', 'smash', 'drops', 'jump', 'quiz']) {
      const [a, b, c] = MINIGAME_FEEL.stars[id];
      expect(a).toBeGreaterThan(0);
      expect(b).toBeGreaterThan(a);
      expect(c).toBeGreaterThan(b);
    }
  });
});
