// Ablauf einer Runde: Countdown, Spielzeit (Frame-Callback auf dem UI-Thread), Pause, Punkte,
// Extra-Leben, Abschluss. Die Uhr ist ein Shared Value, damit Skia-Spiele sie ohne React-Render
// mit 60 fps lesen können. React bekommt nur Phasenwechsel und volle Sekunden.

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { canOfferExtraLife, requestExtraLife } from './extraLife';
import { consumeHitStop } from './fx/fxLogic';
import { finishRound, type RoundResult } from './finishRound';
import {
  countdownDisplay,
  createClock,
  endClock,
  pauseClock,
  resumeClock,
  secondsLeft,
  stepClock,
  type MinigameClock,
  type MinigamePhase,
} from './session';

export interface MinigameSessionOptions {
  gameId: string;
  /** Rundenlänge in Sekunden, null für Spiele ohne Zeitlimit. */
  durationSeconds: number | null;
  /** Spiel kann nach dem Ende mit einem Extra-Leben weitergehen (z. B. Leben-basierte Spiele). */
  supportsExtraLife?: boolean;
}

export interface MinigameSession {
  clock: SharedValue<MinigameClock>;
  phase: MinigamePhase;
  countdown: number;
  secondsLeft: number | null;
  score: number;
  result: RoundResult | null;
  extraLifeOffered: boolean;
  addScore: (points: number) => void;
  /** Spiel meldet das Ende (z. B. alle Leben weg). */
  endGame: () => void;
  pause: () => void;
  resume: () => void;
  /** Beendet die Runde sofort und zahlt die bisherigen Punkte aus. */
  quit: () => void;
  acceptExtraLife: () => void;
  declineExtraLife: () => void;
  /** Das Spiel meldet, was bei einem Extra-Leben passieren soll (z. B. ein Leben zurück). */
  setExtraLifeHandler: (handler: (() => void) | null) => void;
  /** Hält die Spielzeit kurz an (Treffer-Gefühl). Auch aus Worklets aufrufbar. */
  hitStop: (ms: number) => void;
}

export function useMinigameSession({
  gameId,
  durationSeconds,
  supportsExtraLife = false,
}: MinigameSessionOptions): MinigameSession {
  const durationMs = durationSeconds === null ? null : durationSeconds * 1000;
  const [initial] = useState(createClock);
  const clock = useSharedValue<MinigameClock>(initial);
  const hitStopLeft = useSharedValue(0);

  const [phase, setPhase] = useState<MinigamePhase>(initial.phase);
  const [countdown, setCountdown] = useState(countdownDisplay(initial));
  const [timeLeft, setTimeLeft] = useState(secondsLeft(initial, durationMs));
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<RoundResult | null>(null);
  const [extraLifeOffered, setExtraLifeOffered] = useState(false);

  const scoreRef = useRef(0);
  const finishedRef = useRef(false);
  const extraLifeUsedRef = useRef(false);
  const extraLifeHandlerRef = useRef<(() => void) | null>(null);

  const finalize = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clock.set(endClock(clock.get()));
    setExtraLifeOffered(false);
    setPhase('over');
    setResult(finishRound(gameId, scoreRef.current));
  }, [clock, gameId]);

  const handleOver = useCallback(() => {
    if (finishedRef.current) return;
    clock.set(endClock(clock.get()));
    setPhase('over');
    if (canOfferExtraLife(supportsExtraLife, extraLifeUsedRef.current)) {
      setExtraLifeOffered(true);
    } else {
      finalize();
    }
  }, [clock, finalize, supportsExtraLife]);

  useFrameCallback((frame) => {
    'worklet';
    const before = clock.get();
    if (before.phase !== 'countdown' && before.phase !== 'playing') return;
    const held = consumeHitStop(hitStopLeft.get(), frame.timeSincePreviousFrame ?? 0);
    if (held.leftMs !== hitStopLeft.get()) hitStopLeft.set(held.leftMs);
    const next = stepClock(before, held.dtMs, durationMs);
    clock.set(next);
    const cd = countdownDisplay(next);
    if (cd !== countdownDisplay(before)) scheduleOnRN(setCountdown, cd);
    const left = secondsLeft(next, durationMs);
    if (left !== secondsLeft(before, durationMs)) scheduleOnRN(setTimeLeft, left);
    if (next.phase === 'over') scheduleOnRN(handleOver);
    else if (next.phase !== before.phase) scheduleOnRN(setPhase, next.phase);
  });

  const addScore = useCallback(
    (points: number) => {
      if (clock.get().phase !== 'playing') return;
      scoreRef.current += points;
      setScore(scoreRef.current);
    },
    [clock],
  );

  const hitStop = useCallback(
    (ms: number) => {
      'worklet';
      hitStopLeft.set(Math.max(hitStopLeft.get(), ms));
    },
    [hitStopLeft],
  );

  const pause = useCallback(() => {
    const next = pauseClock(clock.get());
    clock.set(next);
    setPhase(next.phase);
  }, [clock]);

  const resume = useCallback(() => {
    const next = resumeClock(clock.get());
    clock.set(next);
    setPhase(next.phase);
  }, [clock]);

  const acceptExtraLife = useCallback(() => {
    extraLifeUsedRef.current = true;
    setExtraLifeOffered(false);
    void requestExtraLife(gameId).then((granted) => {
      if (!granted) {
        finalize();
        return;
      }
      extraLifeHandlerRef.current?.();
      clock.set({ ...clock.get(), phase: 'playing' });
      setPhase('playing');
    });
  }, [clock, finalize, gameId]);

  const setExtraLifeHandler = useCallback((handler: (() => void) | null) => {
    extraLifeHandlerRef.current = handler;
  }, []);

  // Geht die App in den Hintergrund, pausiert die Runde.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') pause();
    });
    return () => sub.remove();
  }, [pause]);

  return {
    clock,
    phase,
    countdown,
    secondsLeft: timeLeft,
    score,
    result,
    extraLifeOffered,
    addScore,
    endGame: handleOver,
    pause,
    resume,
    quit: finalize,
    acceptExtraLife,
    declineExtraLife: finalize,
    setExtraLifeHandler,
    hitStop,
  };
}
