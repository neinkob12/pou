// Reine Logik des Minigame-Gerüsts, ohne React. Die Funktionen mit 'worklet' laufen auch im
// Frame-Callback auf dem UI-Thread (Reanimated); in Tests sind sie normale Funktionen.

import { MINIGAME_FRAMEWORK, MINIGAME_REWARDS } from '../../../game/config';

export type MinigamePhase = 'countdown' | 'playing' | 'paused' | 'over';

/** Uhr einer Runde. Spielzeit läuft nur in 'playing', nie in Pause oder Countdown. */
export interface MinigameClock {
  phase: MinigamePhase;
  /** Restzeit des Start-Countdowns in ms. */
  countdownMs: number;
  /** Gespielte Zeit in ms (ohne Pausen). */
  elapsedMs: number;
  /** Phase vor der Pause, damit "Weiter" dorthin zurückkehrt. */
  resumePhase: 'countdown' | 'playing';
}

export function createClock(countdownSeconds: number = MINIGAME_FRAMEWORK.countdownSeconds): MinigameClock {
  return {
    phase: countdownSeconds > 0 ? 'countdown' : 'playing',
    countdownMs: countdownSeconds * 1000,
    elapsedMs: 0,
    resumePhase: 'countdown',
  };
}

/**
 * Ein Frame-Schritt. `durationMs` null heißt: kein Zeitlimit (Spiel beendet sich selbst).
 * Gibt eine neue Uhr zurück; die alte bleibt unverändert.
 */
export function stepClock(
  clock: MinigameClock,
  dtMs: number,
  durationMs: number | null,
  maxStepMs: number = MINIGAME_FRAMEWORK.maxFrameStepMs,
): MinigameClock {
  'worklet';
  const dt = Math.max(0, Math.min(dtMs, maxStepMs));
  if (clock.phase === 'countdown') {
    const countdownMs = clock.countdownMs - dt;
    if (countdownMs > 0) return { ...clock, countdownMs };
    // Überschuss des Countdowns zählt schon als Spielzeit.
    return { ...clock, phase: 'playing', countdownMs: 0, elapsedMs: clock.elapsedMs - countdownMs };
  }
  if (clock.phase === 'playing') {
    const elapsedMs = clock.elapsedMs + dt;
    if (durationMs !== null && elapsedMs >= durationMs) {
      return { ...clock, phase: 'over', elapsedMs: durationMs };
    }
    return { ...clock, elapsedMs };
  }
  return clock;
}

export function pauseClock(clock: MinigameClock): MinigameClock {
  'worklet';
  if (clock.phase !== 'countdown' && clock.phase !== 'playing') return clock;
  return { ...clock, phase: 'paused', resumePhase: clock.phase };
}

export function resumeClock(clock: MinigameClock): MinigameClock {
  'worklet';
  if (clock.phase !== 'paused') return clock;
  return { ...clock, phase: clock.resumePhase };
}

export function endClock(clock: MinigameClock): MinigameClock {
  'worklet';
  return { ...clock, phase: 'over' };
}

/** Zahl, die der Countdown zeigt (3, 2, 1), 0 wenn er vorbei ist. */
export function countdownDisplay(clock: MinigameClock): number {
  'worklet';
  return Math.max(0, Math.ceil(clock.countdownMs / 1000));
}

/** Ganze Sekunden Restzeit für die Anzeige, null ohne Zeitlimit. */
export function secondsLeft(clock: MinigameClock, durationMs: number | null): number | null {
  'worklet';
  if (durationMs === null) return null;
  return Math.max(0, Math.ceil((durationMs - clock.elapsedMs) / 1000));
}

/** Münzen für eine Runde: Punkte mal Kurs, abgerundet, gedeckelt. */
export function coinsForScore(score: number, rewards: typeof MINIGAME_REWARDS = MINIGAME_REWARDS): number {
  if (!Number.isFinite(score) || score <= 0) return 0;
  return Math.min(rewards.maxCoinsPerRound, Math.floor(score * rewards.coinsPerPoint));
}

/** Neue Highscore-Tabelle, wenn `score` den alten Wert schlägt, sonst dieselbe. */
export function withHighscore(
  highscores: Record<string, number>,
  gameId: string,
  score: number,
): Record<string, number> {
  const old = highscores[gameId] ?? 0;
  if (score <= old) return highscores;
  return { ...highscores, [gameId]: score };
}
