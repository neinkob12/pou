// Schwierigkeitskurve der Minigames (Auftrag 40): Ein Bot mit Reaktionszeit spielt die Regeln
// durch, gemittelt über 20 Startwerte. Gemütliche Spieler holen einen Stern, geübte zwei, sehr
// schnelle drei. Die Zahlen stehen in docs/progress/web2.md.

import { starsFor } from '../../framework/stars';
import { averageScore, simulateDrops, simulateJump, simulateSmash, simulateTap } from '../bots';

interface Case {
  game: string;
  run: (reactionMs: number, seed: number) => number;
  /** Reaktionszeiten in ms: gemütlich, geübt, sehr schnell. */
  slow: number;
  trained: number;
  fast: number;
}

const CASES: Case[] = [
  { game: 'tap', run: simulateTap, slow: 1100, trained: 700, fast: 500 },
  { game: 'smash', run: (ms, seed) => simulateSmash(ms, seed), slow: 1100, trained: 750, fast: 500 },
  { game: 'drops', run: (ms, seed) => simulateDrops(ms, seed), slow: 900, trained: 500, fast: 250 },
  { game: 'jump', run: (ms, seed) => simulateJump(ms, seed), slow: 800, trained: 450, fast: 200 },
];

describe.each(CASES)('$game', ({ game, run, slow, trained, fast }) => {
  const score = (ms: number) => averageScore((seed) => run(ms, seed));
  const s = { slow: score(slow), trained: score(trained), fast: score(fast) };

  it('schnellere Reaktion gibt mehr Punkte', () => {
    expect(s.fast).toBeGreaterThan(s.trained);
    expect(s.trained).toBeGreaterThan(s.slow);
  });

  it('Sterne: gemütlich 1, geübt 2, sehr schnell 3', () => {
    expect(starsFor(game, s.slow)).toBe(1);
    expect(starsFor(game, s.trained)).toBe(2);
    expect(starsFor(game, s.fast)).toBe(3);
  });
});

describe('Tipp den Kreis: Tempo zieht an', () => {
  it('wer zu langsam ist, verpasst gegen Ende Knospen', () => {
    const score = (ms: number) => averageScore((seed) => simulateTap(ms, seed));
    // Bei 1300 ms läuft die Lebenszeit (1400 bis 850 ms) im Lauf der Runde unter die Reaktionszeit.
    expect(score(1300)).toBeLessThan(score(1100) / 2);
  });
});
