import { useFocusEffect } from 'expo-router';
import { useCallback, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';

import { motion } from '../../lib/theme';
import { focusEnterPose, type EnterFrom } from './focusEnterPose';

interface FocusEnterProps {
  children: ReactNode;
  /** Woher das Element kommt: oben (HUD), unten (Dock) oder aus der Mitte (Figur). */
  from: EnterFrom;
  /** Verzögerung in ms, für gestaffelte Auftritte. */
  delay?: number;
  style?: StyleProp<ViewStyle>;
  pointerEvents?: 'box-none' | 'auto';
}

/**
 * Auftritt bei jedem Öffnen des Screens (Redesign): HUD gleitet von oben herein, das Dock von
 * unten, die Figur ploppt aus der Mitte. Gestaffelt, mit leichtem Überschwingen. Nur Transform und
 * Deckkraft; bei "Bewegung reduzieren" sofort da.
 */
export function FocusEnter({ children, from, delay = 0, style, pointerEvents }: FocusEnterProps) {
  const reduced = useReducedMotion();
  const t = useSharedValue(reduced ? 1 : 0);

  useFocusEffect(
    useCallback(() => {
      if (reduced) return;
      t.set(0);
      t.set(withDelay(delay, withSpring(1, motion.enter)));
    }, [reduced, delay, t]),
  );

  const animated = useAnimatedStyle(() => {
    const p = focusEnterPose(from, t.value, motion.enterOffset);
    return { opacity: p.opacity, transform: [{ translateY: p.translateY }, { scale: p.scale }] };
  });

  return (
    <Animated.View pointerEvents={pointerEvents} style={[style, animated]}>
      {children}
    </Animated.View>
  );
}
