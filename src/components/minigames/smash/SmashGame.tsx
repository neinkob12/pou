// "Schädlings-Smash": Whack-a-Mole auf einem großen Blatt. Zustand ist ein Shared Value; Auftauchen
// und Verschwinden laufen im Frame-Callback, Tipps werden ebenfalls auf dem UI-Thread ausgewertet,
// damit Frame und Tipp sich den Zustand nicht gegenseitig überschreiben.

import { Canvas, Line, RoundedRect, vec } from '@shopify/react-native-skia';
import { useEffect, useRef, useState } from 'react';
import { View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import { useDerivedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';

import { PEST_SMASH } from '../../../game/config';
import { colors } from '../../../lib/theme';
import type { MinigameSession } from '../framework/useMinigameSession';
import { CritterSlot } from './CritterSlot';
import { comboMultiplier, createSmashState, earnsPestProtection, holeAt, holeCount, stepSmash, tapHole } from './pestSmash';
import { SmashInfo } from './SmashInfo';
import { grantSmashReward } from './smashReward';

/** Ecken des Platzhalter-Blatts. */
const LEAF_RADIUS = 48;
const HOLES = Array.from({ length: holeCount(PEST_SMASH) }, (_, i) => i);

export function SmashGame({ session }: { session: MinigameSession }) {
  const { clock, addScore, result } = session;
  const size = useSharedValue({ width: 0, height: 0 });
  const state = useSharedValue(createSmashState());
  const score = useSharedValue(0);
  const [combo, setCombo] = useState(0);

  useFrameCallback(() => {
    'worklet';
    const { phase, elapsedMs } = clock.get();
    if (phase !== 'playing' || size.get().width === 0) return;
    const before = state.get();
    const next = stepSmash(before, elapsedMs, Math.random(), Math.random(), PEST_SMASH);
    if (next === before) return;
    state.set(next);
    if (next.combo !== before.combo) scheduleOnRN(setCombo, next.combo);
  });

  const onPoints = (points: number, nextCombo: number) => {
    addScore(points);
    setCombo(nextCombo);
  };

  const tapAt = (x: number, y: number) => {
    'worklet';
    const { phase, elapsedMs } = clock.get();
    if (phase !== 'playing') return;
    const { width, height } = size.get();
    const hole = holeAt(x, y, width, height, PEST_SMASH);
    if (hole < 0) return;
    const outcome = tapHole(state.get(), hole, elapsedMs, score.get(), PEST_SMASH);
    if (outcome.kind === null) return;
    state.set(outcome.state);
    score.set(score.get() + outcome.points);
    scheduleOnRN(onPoints, outcome.points, outcome.state.combo);
  };

  const onTouchStart = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    scheduleOnUI(tapAt, locationX, locationY);
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    size.set({ width, height });
  };

  // Rundenende: Schädlingsschutz zusätzlich zu Münzen (genau einmal pro Runde).
  const rewarded = useRef(false);
  useEffect(() => {
    if (!result || rewarded.current) return;
    rewarded.current = true;
    grantSmashReward(result.score);
  }, [result]);

  const leafWidth = useDerivedValue(() => size.get().width);
  const leafHeight = useDerivedValue(() => size.get().height);
  const veinTop = useDerivedValue(() => vec(size.get().width / 2, 0));
  const veinBottom = useDerivedValue(() => vec(size.get().width / 2, size.get().height));

  return (
    <View className="flex-1">
      <SmashInfo
        combo={combo}
        multiplier={comboMultiplier(combo, PEST_SMASH)}
        protectionEarned={result !== null && earnsPestProtection(result.score)}
      />
      <View className="mx-3 mb-3 flex-1" onLayout={onLayout} onTouchStart={onTouchStart}>
        <Canvas style={{ flex: 1 }} pointerEvents="none">
          {/* Platzhalter für M4 (Blatt-Hintergrund) */}
          <RoundedRect x={0} y={0} width={leafWidth} height={leafHeight} r={LEAF_RADIUS} color={colors.plantLight} />
          <Line p1={veinTop} p2={veinBottom} color={colors.plantDark} strokeWidth={3} opacity={0.4} />
          {HOLES.map((h) => (
            <CritterSlot key={h} hole={h} state={state} clock={clock} size={size} />
          ))}
        </Canvas>
      </View>
    </View>
  );
}
