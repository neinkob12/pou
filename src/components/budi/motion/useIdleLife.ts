import { useEffect, useRef } from 'react';
import { cancelAnimation, useSharedValue, withRepeat, withSequence, withTiming, type SharedValue } from 'react-native-reanimated';

import type { Condition } from '../../../game/needs';
import { idleFidget } from '../budiMood';
import * as M from './constants';
import { blink, curiousTilt, joyHop, lookAround, type BudiBody } from './moves';

/**
 * Atmen und Wippen der Pflanze laufen als Dauer-Animation im UI-Thread (nur Transform, keine
 * Leinwand zeichnet neu). Budi atmet im Schlaf langsamer und tiefer.
 */
export function useBreathAndSway(idle: boolean, asleep: boolean): { breath: SharedValue<number>; sway: SharedValue<number> } {
  const breath = useSharedValue(0);
  const sway = useSharedValue(0);
  useEffect(() => {
    if (!idle) {
      cancelAnimation(breath);
      cancelAnimation(sway);
      breath.set(withTiming(0));
      sway.set(withTiming(0));
      return;
    }
    breath.set(withRepeat(withTiming(1, { duration: asleep ? M.SLEEP_BREATH_MS : M.BREATH_MS }), -1, true));
    // Im Schlaf wippt die Pflanze kaum.
    const swayMs = asleep ? M.SWAY_MS * 1.6 : M.SWAY_MS;
    sway.set(withSequence(withTiming(-1, { duration: swayMs / 2 }), withRepeat(withTiming(1, { duration: swayMs }), -1, true)));
  }, [idle, asleep, breath, sway]);
  return { breath, sway };
}

/**
 * Blinzeln und kleine Gesten (Umschauen, Kopf neigen, Freude-Hüpfer) per Timer statt Dauer-Animation:
 * Es läuft nur etwas, wenn sich wirklich etwas bewegt. Das hält den Browser bei 60 fps.
 * `busyKey` pausiert die Gesten kurz nach einer Pflege, damit sie die Reaktion nicht stören.
 */
export function useIdleLife(body: BudiBody, eyesOpen: boolean, awake: boolean, condition: Condition | null, size: number, busyKey: number) {
  const conditionRef = useRef(condition);
  useEffect(() => {
    conditionRef.current = condition;
  }, [condition]);

  useEffect(() => {
    if (!eyesOpen) {
      body.lid.set(1);
      return;
    }
    let index = 0;
    let timer: ReturnType<typeof setTimeout>;
    const next = () => {
      blink(body);
      index = (index + 1) % M.BLINK_PAUSES_MS.length;
      timer = setTimeout(next, M.BLINK_PAUSES_MS[index]);
    };
    timer = setTimeout(next, M.BLINK_PAUSES_MS[0]);
    return () => clearTimeout(timer);
  }, [eyesOpen, body]);

  useEffect(() => {
    if (!awake) {
      body.gazeX.set(withTiming(0, { duration: M.GAZE_MS }));
      body.gazeY.set(withTiming(0, { duration: M.GAZE_MS }));
      return;
    }
    let index = 0;
    let timer: ReturnType<typeof setTimeout>;
    const next = () => {
      const fidget = idleFidget(index, conditionRef.current);
      if (fidget === 'lookAround') lookAround(body);
      else if (fidget === 'tilt') curiousTilt(body, index % 2 ? 1 : -1);
      else joyHop(body, size, M.SMALL_HOP_HEIGHT);
      index += 1;
      timer = setTimeout(next, M.FIDGET_PAUSES_MS[index % M.FIDGET_PAUSES_MS.length]);
    };
    timer = setTimeout(next, M.FIDGET_PAUSES_MS[0]);
    return () => clearTimeout(timer);
    // busyKey startet die Pause neu, sobald Budi auf eine Pflege reagiert.
  }, [awake, body, size, busyKey]);
}
