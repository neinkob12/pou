// Effekt-Zustand eines Minigames (Auftrag 40): Partikel und Wackeln auf dem UI-Thread, Punkte-Popups
// in React. Die Effekt-Uhr läuft mit der Bildrate weiter, auch während des kurzen Anhaltens.

import { useCallback, useRef, useState } from 'react';
import { useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';

import { MINIGAME_FEEL } from '../../../../game/config';
import { burst, createFx, flash, fxBusy, pruneFx, ring, shake, type BurstOptions, type FxState } from './fxLogic';

export interface Popup {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  /** Größer für Kombo und Rekord. */
  big: boolean;
}

export interface Fx {
  state: SharedValue<FxState>;
  /** Effekt-Uhr in ms (Bild-Zeitstempel). */
  now: SharedValue<number>;
  popups: Popup[];
  /** Partikel; auch aus Worklets aufrufbar. */
  burstAt: (x: number, y: number, opts: BurstOptions) => void;
  /** Kamera-Wackeln; auch aus Worklets aufrufbar. */
  shakeHit: () => void;
  shakeFail: () => void;
  /** Schockwellen-Ring (Auftrag 51); `color` zeigt in die Palette der Szene. Auch aus Worklets. */
  ringAt: (x: number, y: number, color: number, scale?: number) => void;
  /** Weißer Blitz über dem Feld (Auftrag 51). Auch aus Worklets. */
  flash: () => void;
  /** Punkte-Popup (nur JS-Thread, aus Worklets per scheduleOnRN). */
  popup: (x: number, y: number, text: string, color: string, big?: boolean) => void;
  removePopup: (id: number) => void;
}

/**
 * `timeScale`: Tempo der Effekt-Uhr (Zeitlupe der Runde, Auftrag 51). Ohne läuft sie in echter Zeit.
 */
export function useFx(timeScale?: SharedValue<number>): Fx {
  const state = useSharedValue<FxState>(createFx());
  const now = useSharedValue(0);
  const [popups, setPopups] = useState<Popup[]>([]);
  const nextId = useRef(1);

  useFrameCallback((frame) => {
    'worklet';
    const dt = Math.min(frame.timeSincePreviousFrame ?? 0, 100);
    const t = now.get() + dt * (timeScale ? timeScale.get() : 1);
    now.set(t);
    const before = state.get();
    if (!fxBusy(before)) return;
    const next = pruneFx(before, t);
    if (next !== before) state.set(next);
  });

  const burstAt = useCallback(
    (x: number, y: number, opts: BurstOptions) => {
      'worklet';
      state.set(burst(state.get(), x, y, now.get(), opts));
    },
    [now, state],
  );

  const shakeHit = useCallback(() => {
    'worklet';
    state.set(shake(state.get(), now.get(), MINIGAME_FEEL.shakeHitMs, MINIGAME_FEEL.shakeHitPx));
  }, [now, state]);

  const shakeFail = useCallback(() => {
    'worklet';
    state.set(shake(state.get(), now.get(), MINIGAME_FEEL.shakeFailMs, MINIGAME_FEEL.shakeFailPx));
  }, [now, state]);

  const ringAt = useCallback(
    (x: number, y: number, color: number, scale = 1) => {
      'worklet';
      state.set(ring(state.get(), x, y, now.get(), color, scale));
    },
    [now, state],
  );

  const flashNow = useCallback(() => {
    'worklet';
    state.set(flash(state.get(), now.get()));
  }, [now, state]);

  const popup = useCallback((x: number, y: number, text: string, color: string, big = false) => {
    const id = nextId.current;
    nextId.current += 1;
    setPopups((list) => [...list.slice(-7), { id, x, y, text, color, big }]);
  }, []);

  const removePopup = useCallback((id: number) => setPopups((list) => list.filter((p) => p.id !== id)), []);

  return { state, now, popups, burstAt, shakeHit, shakeFail, ringAt, flash: flashNow, popup, removePopup };
}
