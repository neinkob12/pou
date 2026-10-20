import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { lightPhase } from '../../../content/strings';
import { Placeholder } from '../../ui/Placeholder';

/** Dauer der "Puff"-Wolke beim Phasenwechsel. Reine Animation, kein Spielwert. */
export const PUFF_MS = 700;
const PUFF_SIZE = 180;

/** Kurze Wolke, die aufbläht und verschwindet. Bis Grafik da ist: Platzhalter-Kreis. */
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
      <Placeholder label={lightPhase.puff} color="white" width={PUFF_SIZE} height={PUFF_SIZE} round />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
