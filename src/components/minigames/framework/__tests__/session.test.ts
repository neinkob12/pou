import { MINIGAME_REWARDS } from '../../../../game/config';
import {
  coinsForScore,
  countdownDisplay,
  createClock,
  endClock,
  pauseClock,
  resumeClock,
  secondsLeft,
  stepClock,
  withHighscore,
} from '../session';

describe('Minigame-Uhr', () => {
  it('startet mit Countdown und zeigt 3, 2, 1', () => {
    let c = createClock(3);
    expect(c.phase).toBe('countdown');
    expect(countdownDisplay(c)).toBe(3);
    c = stepClock(c, 50, 30_000, 100);
    expect(countdownDisplay(c)).toBe(3);
    for (let i = 0; i < 10; i++) c = stepClock(c, 100, 30_000, 100);
    expect(countdownDisplay(c)).toBe(2);
    expect(c.elapsedMs).toBe(0);
  });

  it('ohne Countdown geht es direkt los', () => {
    expect(createClock(0).phase).toBe('playing');
  });

  it('Überschuss des Countdowns zählt als Spielzeit', () => {
    let c = createClock(1);
    for (let i = 0; i < 9; i++) c = stepClock(c, 100, null, 100);
    c = stepClock(c, 50, null, 100);
    expect(c.phase).toBe('countdown');
    c = stepClock(c, 100, null, 100);
    expect(c.phase).toBe('playing');
    expect(c.elapsedMs).toBe(50);
  });

  it('kappt lange Frames (Ruckler, Hintergrund)', () => {
    const c = stepClock(createClock(0), 5000, null, 100);
    expect(c.elapsedMs).toBe(100);
    expect(stepClock(createClock(0), -20, null, 100).elapsedMs).toBe(0);
  });

  it('endet genau bei der Rundenlänge', () => {
    let c = createClock(0);
    for (let i = 0; i < 20; i++) c = stepClock(c, 100, 1000, 100);
    expect(c.phase).toBe('over');
    expect(c.elapsedMs).toBe(1000);
    expect(secondsLeft(c, 1000)).toBe(0);
    expect(stepClock(c, 100, 1000, 100)).toBe(c);
  });

  it('Pause hält die Zeit an und kehrt in die richtige Phase zurück', () => {
    let c = stepClock(createClock(0), 100, 10_000, 100);
    c = pauseClock(c);
    expect(c.phase).toBe('paused');
    const paused = stepClock(c, 100, 10_000, 100);
    expect(paused.elapsedMs).toBe(100);
    expect(resumeClock(paused).phase).toBe('playing');

    const fromCountdown = pauseClock(createClock(3));
    expect(resumeClock(fromCountdown).phase).toBe('countdown');
  });

  it('Pause und Weiter ändern eine beendete Runde nicht', () => {
    const over = endClock(createClock(0));
    expect(pauseClock(over)).toBe(over);
    expect(resumeClock(over)).toBe(over);
  });

  it('Restzeit in ganzen Sekunden, null ohne Zeitlimit', () => {
    const c = stepClock(createClock(0), 100, 30_000, 100);
    expect(secondsLeft(c, 30_000)).toBe(30);
    expect(secondsLeft(c, null)).toBeNull();
  });
});

describe('Belohnung und Rekord', () => {
  it('Münzen: Punkte mal Kurs, abgerundet, gedeckelt', () => {
    expect(coinsForScore(0)).toBe(0);
    expect(coinsForScore(-5)).toBe(0);
    expect(coinsForScore(Number.NaN)).toBe(0);
    expect(coinsForScore(7)).toBe(Math.floor(7 * MINIGAME_REWARDS.coinsPerPoint));
    expect(coinsForScore(100_000)).toBe(MINIGAME_REWARDS.maxCoinsPerRound);
  });

  it('Highscore nur bei echter Verbesserung', () => {
    const a = withHighscore({}, 'tap', 10);
    expect(a).toEqual({ tap: 10 });
    expect(withHighscore(a, 'tap', 10)).toBe(a);
    expect(withHighscore(a, 'tap', 3)).toBe(a);
    expect(withHighscore(a, 'tap', 12)).toEqual({ tap: 12 });
    expect(withHighscore(a, 'smash', 0)).toBe(a);
  });
});
