// "Tropfen fangen": Topf unten per Wischen bewegen, Wasser und Dünger fangen, Salz meiden.
// Feld und Topf sind Shared Values (UI-Thread, 60 fps). React bekommt nur Punkte, Leben und
// Fänge. Am Rundenende füllen die Fänge Budis Balken über applyCare (dropsReward.ts).

import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { dropsGame as t } from '../../../content/strings';
import { DROPS_GAME, MINIGAME_FRAMEWORK } from '../../../game/config';
import type { MinigameSession } from '../framework/useMinigameSession';
import { DropsCanvas } from './DropsCanvas';
import { DropsHud } from './DropsHud';
import { barGain, clampPot, createField, grantExtraLife, stepField, type DropsReward } from './dropsLogic';
import { applyDropsReward } from './dropsReward';

export function DropsGame({ session }: { session: MinigameSession }) {
  const { clock, addScore, endGame, setExtraLifeHandler, phase, result } = session;
  const size = useSharedValue({ width: 0, height: 0 });
  const field = useSharedValue(createField(0));
  const [lives, setLives] = useState<number>(DROPS_GAME.lives);
  const [caught, setCaught] = useState({ water: 0, fertilizer: 0 });
  const [reward, setReward] = useState<DropsReward | null | undefined>(undefined);
  const rewardedRef = useRef(false);

  const onStep = useCallback(
    (points: number, livesLeft: number, water: number, fertilizer: number) => {
      if (points > 0) {
        addScore(points);
        setCaught({ water, fertilizer });
      }
      setLives(livesLeft);
      if (livesLeft <= 0) endGame();
    },
    [addScore, endGame],
  );

  useFrameCallback((frame) => {
    'worklet';
    const { phase: p, elapsedMs } = clock.get();
    const { width, height } = size.get();
    const before = field.get();
    if (p !== 'playing' || width === 0 || before.lives <= 0) return;
    const dt = Math.min(frame.timeSincePreviousFrame ?? 0, MINIGAME_FRAMEWORK.maxFrameStepMs);
    const { field: next, events } = stepField(before, dt, elapsedMs, width, height, Math.random(), Math.random());
    field.set(next);
    if (events.points > 0 || events.livesLost > 0) {
      scheduleOnRN(onStep, events.points, next.lives, next.caughtWater, next.caughtFertilizer);
    }
  });

  // Extra-Leben (P29): ein Leben zurück, Salz vom Feld.
  useEffect(() => {
    setExtraLifeHandler(() => {
      const next = grantExtraLife(field.get());
      field.set(next);
      setLives(next.lives);
    });
    return () => setExtraLifeHandler(null);
  }, [field, setExtraLifeHandler]);

  // Rundenende (auch "Aufhören" in der Pause): einmal die Balken füllen.
  useEffect(() => {
    if (!result || rewardedRef.current) return;
    rewardedRef.current = true;
    const f = field.get();
    setReward(applyDropsReward(f.caughtWater, f.caughtFertilizer));
  }, [field, result]);

  const pan = usePanGesture({
    minDistance: 0,
    onUpdate: (e) => {
      'worklet';
      const f = field.get();
      field.set({ ...f, potX: clampPot(f.potX + e.changeX, size.get().width) });
    },
  });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    size.set({ width, height });
    const f = field.get();
    field.set({ ...f, potX: clampPot(f.potX || width / 2, width) });
  };

  const gain = { water: barGain(caught.water), nutrients: barGain(caught.fertilizer) };
  return (
    <View className="flex-1">
      <DropsHud lives={lives} gain={gain} reward={reward} />
      {phase === 'countdown' && <Text className="px-4 text-center font-body text-base text-ink">{t.hint}</Text>}
      <GestureDetector gesture={pan}>
        <View className="flex-1" onLayout={onLayout}>
          <DropsCanvas field={field} size={size} />
        </View>
      </GestureDetector>
    </View>
  );
}
