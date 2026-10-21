import { useFocusEffect } from 'expo-router';
import { useCallback, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../../lib/theme';
import { enterPose, SCREEN_ENTER } from '../feedback/rewardFx';

/**
 * Übergang wie im Spiel (ART-5): Bei jedem Öffnen des Screens dunkelt er kurz ab, der Inhalt federt
 * von etwas kleiner und tiefer herein und schießt leicht über. Nur Transform und Deckkraft.
 */
export function ScreenEnter({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(reduced ? 1 : 0);
  const dim = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      if (reduced) return;
      t.set(0);
      t.set(withSpring(1, { damping: SCREEN_ENTER.damping, stiffness: SCREEN_ENTER.stiffness }));
      dim.set(SCREEN_ENTER.dim);
      dim.set(withTiming(0, { duration: SCREEN_ENTER.dimMs }));
    }, [reduced, t, dim]),
  );

  const content = useAnimatedStyle(() => {
    const p = enterPose(t.value);
    return { opacity: p.opacity, transform: [{ translateY: p.translateY }, { scale: p.scale }] };
  });
  const shade = useAnimatedStyle(() => ({ opacity: dim.value }));

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={[{ flex: 1 }, content]}>{children}</Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.ink }, shade]}
      />
    </View>
  );
}
