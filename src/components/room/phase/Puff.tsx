import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, outline } from '../../../lib/theme';

/** Dauer der "Puff"-Wolke beim Phasenwechsel. Reine Animation, kein Spielwert. */
export const PUFF_MS = 700;
const PUFF_SIZE = 180;

/** Kugeln der Wolke: Lage und Größe relativ zu PUFF_SIZE (ART-4). */
const BALLS = [
  { x: 0.5, y: 0.5, r: 0.3 },
  { x: 0.25, y: 0.55, r: 0.22 },
  { x: 0.75, y: 0.55, r: 0.22 },
  { x: 0.38, y: 0.3, r: 0.2 },
  { x: 0.64, y: 0.32, r: 0.19 },
  { x: 0.5, y: 0.75, r: 0.2 },
];

/** Kurze Wolke, die aufbläht und verschwindet: weiße Kugeln mit Kontur wie im Comic. */
export function Puff({ playKey }: { playKey: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: PUFF_MS, easing: Easing.out(Easing.quad) });
  }, [playKey, progress]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ scale: 0.4 + progress.value * 1.2 }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center, style]}>
      <View style={{ width: PUFF_SIZE, height: PUFF_SIZE }}>
        {BALLS.map((b) => (
          <View
            key={`${b.x}${b.y}`}
            style={[
              styles.ball,
              { left: (b.x - b.r) * PUFF_SIZE, top: (b.y - b.r) * PUFF_SIZE, width: b.r * 2 * PUFF_SIZE, height: b.r * 2 * PUFF_SIZE },
            ]}
          />
        ))}
        {BALLS.map((b) => (
          <View
            key={`i${b.x}${b.y}`}
            style={[
              styles.inner,
              {
                left: (b.x - b.r) * PUFF_SIZE + outline.regular,
                top: (b.y - b.r) * PUFF_SIZE + outline.regular,
                width: b.r * 2 * PUFF_SIZE - outline.regular * 2,
                height: b.r * 2 * PUFF_SIZE - outline.regular * 2,
              },
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  // Erst alle Konturen, dann alle Füllungen darüber: so verschmelzen die Kugeln zu einer Wolke.
  ball: { position: 'absolute', borderRadius: 999, backgroundColor: outline.color },
  inner: { position: 'absolute', borderRadius: 999, backgroundColor: colors.white },
});
