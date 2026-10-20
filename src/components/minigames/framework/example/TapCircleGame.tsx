// Beispielspiel "Tipp den Kreis": prüft das Gerüst. Kreis wird mit Skia gezeichnet, Position und
// Größe sind Shared Values (UI-Thread, 60 fps). Treffer werden im JS-Thread geprüft.

import { Canvas, Circle } from '@shopify/react-native-skia';
import { View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import { useDerivedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';

import { TAP_CIRCLE } from '../../../../game/config';
import { colors } from '../../../../lib/theme';
import type { MinigameSession } from '../useMinigameSession';
import { NO_CIRCLE, isHit, needsRespawn, placeCircle, radiusForHits, type TapCircle } from './tapCircle';

export function TapCircleGame({ session }: { session: MinigameSession }) {
  const { clock, addScore } = session;
  const size = useSharedValue({ width: 0, height: 0 });
  const circle = useSharedValue<TapCircle>(NO_CIRCLE);
  const hits = useSharedValue(0);

  // Kreis erscheint zum Spielstart und springt weiter, wenn er zu lange stehen bleibt.
  useFrameCallback(() => {
    'worklet';
    const { phase, elapsedMs } = clock.get();
    const { width, height } = size.get();
    if (phase !== 'playing' || width === 0) return;
    if (needsRespawn(circle.get(), elapsedMs)) {
      circle.set(placeCircle(Math.random(), Math.random(), width, height, radiusForHits(hits.get()), elapsedMs));
    }
  });

  const cx = useDerivedValue(() => circle.get().x);
  const cy = useDerivedValue(() => circle.get().y);
  const r = useDerivedValue(() => circle.get().r);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    size.set({ width, height });
  };

  const onTouchStart = (e: GestureResponderEvent) => {
    const { phase, elapsedMs } = clock.get();
    if (phase !== 'playing') return;
    const { locationX, locationY } = e.nativeEvent;
    if (!isHit(circle.get(), locationX, locationY)) return;
    hits.set(hits.get() + 1);
    const { width, height } = size.get();
    circle.set(placeCircle(Math.random(), Math.random(), width, height, radiusForHits(hits.get()), elapsedMs));
    addScore(TAP_CIRCLE.pointsPerHit);
  };

  return (
    <View className="flex-1" onLayout={onLayout} onTouchStart={onTouchStart}>
      <Canvas style={{ flex: 1 }} pointerEvents="none">
        <Circle cx={cx} cy={cy} r={r} color={colors.coral} />
      </Canvas>
    </View>
  );
}
